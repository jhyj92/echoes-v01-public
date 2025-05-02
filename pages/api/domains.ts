// pages/api/domains.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim());
let orIndex = 0;
function nextOrKey() {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return key;
}

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY! });

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
  const { answers } = req.body;
  if (!Array.isArray(answers) || !answers.length) {
    return res.status(400).json({ error: "Missing answers" });
  }

  const prompt = `
Based on these 10 answers: ${answers.join(" | ")},
suggest exactly five distinct, poetic "super-power domains"
(e.g. "Weaver of Connections", "Silent Observer").
Return just the list.
  `.trim();

  // 1️⃣ Gemini primary
  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [prompt],
    });
    if (!resp || !resp.text) {
    res.status(500).json({ error: 'Invalid response structure.' });
    return;
  }

  const list = resp.text
      .split(/[\r\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5);
    return res.status(200).json({ suggestions: list });
  } catch {}

  // 2️⃣ OpenRouter fallback
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
      const list = choices[0].message.content
        .split(/[\r\n,]+/)
        .map((s: string) => s.trim())
        .filter((s: string) => Boolean(s))
        .slice(0, 5);
      return res.status(200).json({ suggestions: list });
    } catch {}
  }

  // 3️⃣ Hard fallback
  res
    .status(200)
    .json({ suggestions: ["Curiosity", "Courage", "Reflection", "Discovery", "Wonder"] });
}
