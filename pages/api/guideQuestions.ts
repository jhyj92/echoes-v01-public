// pages/api/guideQuestions.ts

import type { NextApiRequest, NextApiResponse } from "next";
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

function nextGmKey(): string {
  const key = GM_KEYS[gmIndex % GM_KEYS.length];
  gmIndex++;
  return key;
}

function nextOrKey(): string {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return key;
}

type Data = {
  question?: string;
  done?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { domain, answersSoFar } = req.body as {
    domain?: string;
    answersSoFar?: string[];
  };

  if (typeof domain !== "string" || !Array.isArray(answersSoFar)) {
    return res.status(400).json({ error: "Invalid request body." });
  }

  const step = answersSoFar.length;
  if (step >= 10) {
    // All questions asked
    return res.status(200).json({ done: true });
  }

  // Build the system and user prompts
  const systemPrompt = `You are Echoes’ poetic guide.`;

  // Define a short list of sample question stems to vary phrasing
  const stems = [
    "Recall a moment when your actions in this domain felt effortless. What happened?",
    "Think of a time you used this strength to help someone—how did it unfold?",
    "Describe an instance when this domain made you feel most alive. What details stand out?",
    "Share a memory where you overcame a challenge using insights from this domain.",
    "When have you noticed others relying on this particular gift of yours?",
    "Tell me about a quiet moment of mastery within this domain—what did you discover?",
    "Reflect on a time your intuition in this domain guided you—what did it reveal?",
    "Recall a moment of failure in this domain—what lesson emerged for you?",
    "Describe how this domain shapes the way you view everyday life around you.",
    "Imagine this strength at its fullest—what vision does that conjure?"
  ];

  const questionStem = stems[step];

  const userPrompt = `
Domain: "${domain}"

Reflect on this domain through your own lived experience.  
My guiding reflection question #${step + 1}:
${questionStem}

Constraints:
- Ask only this single question.
- Use poetic, narrative-driven language.
- Do not explain or coach—just the question.
- Return only the markdown-formatted question itself.
  `.trim();

  // Try Gemini primary
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
            temperature: 0.85,
            stopSequences: ["\n"]
          }),
        },
        8000
      );

      if (!resp.ok) continue;
      const data = await resp.json();
      const question = data.candidates?.[0]?.content?.trim();
      if (question) {
        return res.status(200).json({ question });
      }
    } catch {
      // try next Gemini key
    }
  }

  // Fallback to DeepSeek
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
              { role: "user", content: userPrompt }
            ],
            temperature: 0.3,
            stop: ["\n"]
          }),
        },
        8000
      );

      if (!resp.ok) continue;
      const { choices } = await resp.json();
      const question = choices?.[0]?.message?.content?.trim();
      if (question) {
        return res.status(200).json({ question });
      }
    } catch {
      // try next OR key
    }
  }

  // Static fallback
  return res.status(200).json({
    question: stems[step]
  });
}
