// pages/api/guideIntro.js

import dotenv from "dotenv";
dotenv.config();

import fetchWithTimeout from "@/utils/fetchWithTimeout";

const GM_KEYS = (process.env.GEMINI_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);
const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

let gmIndex = 0;
let orIndex = 0;

function nextGmKey() {
  const key = GM_KEYS[gmIndex % GM_KEYS.length];
  gmIndex++;
  return key;
}

function nextOrKey() {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return key;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { domain } = req.body || {};
  if (!domain || typeof domain !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid 'domain' in request body." });
  }

  // 1. Define the system prompt (persona)
  const systemPrompt = `
You are Echoes’ poetic narrative guide.
  `.trim();

  // 2. Define the user prompt (task + constraints)
  const userPrompt = `
Domain: "${domain}"

Now that "${domain}" is your chosen super-power domain, let us delve deeper. Consider this domain through the lens of your experiences, your inherent inclinations, and those moments where you feel most uniquely capable.

Constraints:
• Ask exactly one user-facing question in this response.
• Questions must be poetic and narrative-driven, prompting specific, nuanced reflection.
• Guide the user toward uncovering the precise nature of their superpower within this domain.
• Avoid direct, factual phrasing—use evocative language only.
• Do not explain the purpose or provide coaching text.
• Return only the markdown-formatted question itself.

Please ask your first guiding reflection question now.
  `.trim();

  // 3. Attempt with Gemini (primary)
  for (let i = 0; i < GM_KEYS.length; i++) {
    try {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-preview-04-17:generateMessage?key=${nextGmKey()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: {
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ]
            },
            temperature: 0.85,
            stopSequences: ["\n"]  // ensures only one question is returned
          }),
        },
        8000
      );

      if (!response.ok) continue;
      const data = await response.json();
      const question = data.candidates?.[0]?.content?.trim();
      if (question) {
        return res.status(200).json({ question });
      }
    } catch (e) {
      // try next Gemini key
    }
  }

  // 4. Fallback with DeepSeek (secondary)
  for (let j = 0; j < OR_KEYS.length; j++) {
    try {
      const response = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${nextOrKey()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.3,
            stop: ["\n"]
          }),
        },
        8000
      );

      if (!response.ok) continue;
      const { choices } = await response.json();
      const question = choices?.[0]?.message?.content?.trim();
      if (question) {
        return res.status(200).json({ question });
      }
    } catch (e) {
      // try next DeepSeek key
    }
  }

  // 5. Ultimate fallback if both AI calls fail
  return res.status(200).json({
    question: "What moment in your life first made you aware of this strength?"
  });
}
