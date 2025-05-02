// pages/api/domains.js

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

  const { answers } = req.body || {};
  if (!Array.isArray(answers) || answers.length !== 10) {
    return res
      .status(400)
      .json({ error: "Please supply exactly 10 answers as an array." });
  }

  // Build the user prompt bullets
  const bulletList = answers.map((a) => `• ${a}`).join("\n");

  // System + User prompts
  const systemPrompt = `
You are Echoes’ poetic domain suggester.
Your task is to craft exactly five short, nuanced “super-power domain” labels from a user’s answers.
Labels should be distinct, poetic, and reflect intersectional strengths—avoid generic terms.
  `.trim();

  const userPrompt = `
Task: Based on the following user answers, identify five distinct and nuanced "super-power domains."

User Answers:
${bulletList}

Constraints:
1. Generate exactly five distinct items.
2. Each item must be a short, poetic label (e.g., "Weaver of Connections").
3. Domains must directly reflect the unique intersections in the user's answers.
4. Do NOT add any extra commentary—output only the numbered list.

Output Format:
1. [Domain Label 1]
2. [Domain Label 2]
3. [Domain Label 3]
4. [Domain Label 4]
5. [Domain Label 5]
  `.trim();

  // 1) Primary: Gemini 2.5 Flash Preview
  for (let i = 0; i < GM_KEYS.length; i++) {
    try {
      const resp = await fetchWithTimeout(
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
            temperature: 0.8,
            stopSequences: ["\n6."]
          }),
        },
        8000
      );

      if (!resp.ok) continue;
      const data = await resp.json();
      const text = data.candidates?.[0]?.content || "";
      const suggestions = text
        .split(/\r?\n/)
        .map((l) => l.replace(/^\d+\.\s*/, "").trim())
        .filter((l) => l)
        .slice(0, 5);

      if (suggestions.length === 5) {
        return res.status(200).json({ suggestions });
      }
    } catch (err) {
      // try next key
    }
  }

  // 2) Fallback: OpenRouter DeepSeek
  for (let j = 0; j < OR_KEYS.length; j++) {
    try {
      const resp = await fetchWithTimeout(
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
              { role: "user", content: userPrompt },
            ],
            temperature: 0.2,
            stop: ["\n6."],
          }),
        },
        8000
      );

      if (!resp.ok) continue;
      const { choices } = await resp.json();
      const text = choices?.[0]?.message?.content || "";
      const suggestions = text
        .split(/\r?\n/)
        .map((l) => l.replace(/^\d+\.\s*/, "").trim())
        .filter((l) => l)
        .slice(0, 5);

      if (suggestions.length === 5) {
        return res.status(200).json({ suggestions });
      }
    } catch (err) {
      // next OR key
    }
  }

  // 3) Ultimate fallback
  return res
    .status(200)
    .json({
      suggestions: [
        "Curiosity Weaver",
        "Silent Observer",
        "Harmonizer of Discord",
        "Bridge Between Worlds",
        "Mirror of Insight"
      ]
    });
}
