// pages/api/extractTraits.ts

import type { NextApiRequest, NextApiResponse } from "next";
import genai from "google-generativeai";
import dotenv from "dotenv";
dotenv.config();

// Configure Gemini SDK
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

type TraitResponse = {
  traits: string[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TraitResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ traits: [], error: "Method Not Allowed" });
  }

  const { text } = req.body as { text?: string };
  if (typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ traits: [], error: "Missing text" });
  }

  const systemPrompt = `
You are Echoes’ insightful trait extractor. 
Given the user’s free-form response, return a JSON array of 4–6 concise personality traits 
or strengths implied by their answer.`;

  const userPrompt = `
User response:
"${text}"

Output:
A JSON array of trait keywords, e.g.
["Curiosity","Strategic Thinking","Empathy","Resilience"].
`;

  // 1) Try Gemini primary
  try {
    const response = await genai.generateMessage({
      model: "gemini-2.5-flash-preview-04-17",
      prompt: {
        messages: [
          { role: "system", content: systemPrompt.trim() },
          { role: "user", content: userPrompt.trim() },
        ],
      },
      temperature: 0.5,
    });

    const raw = response.text.trim();
    try {
      const parsed: string[] = JSON.parse(raw);
      return res.status(200).json({ traits: parsed });
    } catch {
      // fallback to regex parse
      const items = raw
        .replace(/[\[\]]/g, "")
        .split(/[,\\n]/)
        .map((s) => s.replace(/["']/g, "").trim())
        .filter(Boolean);
      return res.status(200).json({ traits: items.slice(0, 6) });
    }
  } catch {
    // continue to OpenRouter fallback
  }

  // 2) Fallback to OpenRouter
  for (let i = 0; i < OR_KEYS.length; i++) {
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
              { role: "system", content: systemPrompt.trim() },
              { role: "user", content: userPrompt.trim() },
            ],
            temperature: 0.5,
          }),
        },
        8000
      );
      if (!resp.ok) continue;
      const json = await resp.json();
      const textOut = json.choices?.[0]?.message?.content?.trim() || "";
      const items = textOut
        .replace(/[\[\]]/g, "")
        .split(/[,\\n]/)
        .map((s: string) => s.replace(/["']/g, "").trim())
        .filter(Boolean);
      return res.status(200).json({ traits: items.slice(0, 6) });
    } catch {
      continue;
    }
  }

  // Ultimate fallback
  return res.status(200).json({
    traits: ["Curiosity", "Reflection", "Creativity", "Resilience"],
  });
}
