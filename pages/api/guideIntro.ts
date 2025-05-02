// pages/api/guideQuestions.ts

import type { NextApiRequest, NextApiResponse } from "next";
import genai from "google-generativeai";
import dotenv from "dotenv";
dotenv.config();

genai.configure({ api_key: process.env.GOOGLE_API_KEY });

import fetchWithTimeout from "@/utils/fetchWithTimeout";

const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);
let orIndex = 0;
function nextOrKey(): string {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return key;
}

type GuideQSResponse = {
  question?: string;
  done?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GuideQSResponse>
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
    return res.status(400).json({ error: "Invalid request" });
  }

  const step = answersSoFar.length;
  if (step >= 10) {
    return res.status(200).json({ done: true });
  }

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

  const systemPrompt = `You are Echoes’ poetic guide.`;
  const userPrompt = `
Domain: "${domain}"

My guiding reflection #${step + 1}:
${stems[step]}

Constraints:
- Ask only this question.
- Poetic, narrative-driven.
- No explanations.
`.trim();

  // Gemini primary
  try {
    const resp = await genai.generateMessage({
      model: "gemini-2.5-flash-preview-04-17",
      prompt: {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      },
      temperature: 0.85
    });
    const q = resp.text.trim();
    return res.status(200).json({ question: q });
  } catch {
    // fallback OR
  }

  // OpenRouter fallback
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const resp = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${nextOrKey()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.3
          })
        },
        8000
      );
      if (!resp.ok) continue;
      const js = await resp.json();
      const q = js.choices?.[0]?.message?.content?.trim() || stems[step];
      return res.status(200).json({ question: q });
    } catch {
      continue;
    }
  }

  return res.status(200).json({ question: stems[step] });
}
