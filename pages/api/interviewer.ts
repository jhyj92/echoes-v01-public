// pages/api/interviewer.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// OpenRouter key rotation
const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim());
let orIndex = 0;
function nextOrKey() {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return key;
}

// Gemini client
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY! });

// Simple fetch with timeout
async function fetchWithTimeout(url: string, opts: any = {}, ms = 10000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();
  const { idx, answers } = req.body;
  if (typeof idx !== "number" || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Missing idx or answers" });
  }

  const prompt = `
You are Echoes, a poetic interviewer designed to gently unveil a visitor's subtle,
unique superpower. Ask question ${idx + 1}/10, building on previous answers:
${answers.join(" | ")}. Return only the next open-ended question—no meta commentary.
  `.trim();

  // 1️⃣ Gemini primary
  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [prompt],
    });
    return res.status(200).json({ question: resp.text.trim() });
  } catch (_e) {
    // fall through to OpenRouter
  }

  // 2️⃣ OpenRouter fallback
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          { role: "system", content: "You are a poetic interviewer." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      };
      const r = await fetchWithTimeout(
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
      if (!r.ok) continue;
      const { choices } = await r.json();
      return res.status(200).json({ question: choices[0].message.content.trim() });
    } catch {}
  }

  // 3️⃣ Hard fallback
  res
    .status(200)
    .json({ question: "What small task absorbs you completely?" });
}
