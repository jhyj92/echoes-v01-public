// pages/api/domains.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);
let orIndex = 0;
function nextOrKey() {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return key;
}

// Initialize Gemini SDK client
const genAI = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_KEY!,
});

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  ms = 10000
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }
  const { answers } = req.body as { answers?: string[] };
  if (!answers || !answers.length) {
    return res.status(400).json({ error: "Missing answers" });
  }

  const prompt = `Based on these answers:\n${answers
    .map((a) => `• ${a}`)
    .join("\n")}\n\nSuggest exactly five distinct, poetic super-power domains.`;

  // 1️⃣ Try Gemini (primary)
  try {
    const chatModel = genAI.getChatModel({
      model: "gemini-2.5-flash-preview-04-17",
    });
    const response = await chatModel.generateMessage({
      prompt: { text: prompt },
      temperature: 0.8,
    });
    const text = response.candidates?.[0]?.content || "";
    const suggestions = text
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5);
    if (suggestions.length === 5) {
      return res.status(200).json({ suggestions });
    }
    // otherwise fall through to OR
  } catch (e) {
    console.error("Gemini fallback:", e);
  }

  // 2️⃣ Fallback to OpenRouter DeepSeek
  for (let i = 0; i < OR_KEYS.length; i++) {
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
              { role: "system", content: "You suggest poetic domains." },
              { role: "user", content: prompt },
            ],
            temperature: 0.8,
          }),
        },
        10000
      );
      if (!response.ok) continue;
      const { choices } = await response.json();
      const text = choices[0].message.content;
      const suggestions = text
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5);
      return res.status(200).json({ suggestions });
    } catch {}
  }

  // 3️⃣ Ultimate fallback
  return res.status(200).json({
    suggestions: [
      "Weaver of Connections",
      "Silent Observer",
      "Harmonizer of Discord",
      "Navigator of Paradox",
      "Bearer of Light",
    ],
  });
}
