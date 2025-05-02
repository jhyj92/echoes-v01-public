// pages/api/domains.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim());
let orIndex = 0;
function nextOrKey() {
  const k = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return k;
}

// Instantiate Gemini client
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY!,
});

async function fetchWithTimeout(
  url: string,
  options: any = {},
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
    return res.status(405).end();
  }
  const { answers } = req.body || {};
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "Missing answers" });
  }

  // Build a simple user prompt
  const prompt = `Based on these answers: ${answers.join(
    ", "
  )}, suggest 5 nuanced super-power domains.`;

  // 1️⃣ Primary: Gemini
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [prompt],
    });
    const suggestions = response.text
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5);
    return res.status(200).json({ suggestions });
  } catch (gemErr) {
    console.warn("Gemini failed, falling back to OpenRouter:", gemErr);
  }

  // 2️⃣ Secondary: OpenRouter
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          { role: "system", content: "You are an insightful domain suggester." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      };
      const response = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${nextOrKey()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
        10000
      );
      if (!response.ok) continue;
      const { choices } = await response.json();
      const text = choices[0].message.content as string;
      const suggestions = text
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5);
      return res.status(200).json({ suggestions });
    } catch {
      // try next key
    }
  }

  // 3️⃣ Hardcoded fallback
  res.status(200).json({
    suggestions: [
      "Curiosity Weaver",
      "Echo Reflector",
      "Stillness Seeker",
      "Wonder Forger",
      "Soul Cartographer",
    ],
  });
}
