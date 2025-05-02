// pages/api/interviewer.ts
import type { NextApiRequest, NextApiResponse } from "next";
import genai from "google-generativeai";
import dotenv from "dotenv";
import fetchWithTimeout from "@/utils/fetchWithTimeout";

dotenv.config();
genai.configure({ api_key: process.env.GOOGLE_API_KEY });

// Round-robin OpenRouter keys for fallback
const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);
let orIndex = 0;
function nextOrKey(): string {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex += 1;
  return key;
}

type ReqBody = { answersSoFar?: string[] };
type ResBody = { question?: string; done?: boolean; error?: string };

const STATIC_QUESTIONS = [
  "What's something you can lose yourself in for hours?",
  "What specific part of that activity captivates you most?",
  "When you engage with it, do you focus on solving problems, creating beauty, or something else?",
  "Outside of that context, where else do you notice yourself drawn to the same pattern?",
  "Describe a moment when you felt most alive doing this—what emotions arose?",
  "Have you ever taught someone else this skill or passion? What did you focus on?",
  "When you hit a roadblock, how do you adapt or overcome?",
  "How do others react when they see you in this element of flow?",
  "If you could elevate this even further, what would the next level look like?",
  "Imagine this as your superpower—what name would you give it?"
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResBody>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { answersSoFar } = (req.body || {}) as ReqBody;
  if (!Array.isArray(answersSoFar)) {
    return res.status(400).json({ error: "Missing answersSoFar array" });
  }

  const step = answersSoFar.length;
  if (step >= 10) {
    // All done!
    return res.status(200).json({ done: true });
  }

  const systemPrompt = `
You are Echoes, a poetic interviewer designed to gently unveil a visitor's subtle, unique "superpower"—that singular thing they do better than anyone else. 
You will ask exactly one evocative open-ended question at a time, never explain why, and stop after ten questions.
`.trim();

  const userPrompt = `
Previous answers:
${answersSoFar.map((a, i) => `${i + 1}. ${a}`).join("\n")}

Now ask question #${step + 1}:
`.trim();

  // 1) Try Gemini primary
  try {
    const gi = await genai.generateMessage({
      model: "gemini-2.5-flash-preview-04-17",
      prompt: {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      },
      temperature: 0.8
    });
    const question = gi.text.trim();
    if (question) {
      return res.status(200).json({ question });
    }
  } catch {
    // fall through to OR
  }

  // 2) OpenRouter fallback
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const response = await fetchWithTimeout(
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
            temperature: 0.8
          })
        },
        8000
      );
      if (!response.ok) continue;
      const json = await response.json();
      const qs = json.choices?.[0]?.message?.content?.trim();
      if (qs) {
        return res.status(200).json({ question: qs });
      }
    } catch {
      continue;
    }
  }

  // 3) Ultimate static fallback
  const fallbackQ = STATIC_QUESTIONS[step] || "Thank you—please proceed.";
  return res.status(200).json({ question: fallbackQ });
}
