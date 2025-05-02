// pages/api/heroChat.ts
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
  const { scenario, history, userMessage } = req.body;
  if (
    typeof scenario !== "string" ||
    !Array.isArray(history) ||
    typeof userMessage !== "string"
  ) {
    return res.status(400).json({ error: "Missing scenario/history/message" });
  }

  // Build chat messages
  const messages = [
    { role: "system", content: `Scenario: ${scenario}` },
    ...history.map((m: any) => ({
      role: m.from === "hero" ? "assistant" : "user",
      content: m.text,
    })),
    { role: "user", content: userMessage },
  ];

  // Gemini primary
  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [messages.map((m) => m.content).join("\n")],
    });
    if (!resp || !resp.text) {
      return res.status(500).json({ error: 'Invalid response structure.' });
    }
    return res.status(200).json({ reply: resp.text.trim() });
  } catch {}

  // OpenRouter fallback
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages,
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
      return res.status(200).json({ reply: choices[0].message.content.trim() });
    } catch {}
  }

  res.status(200).json({ reply: "…" });
}
