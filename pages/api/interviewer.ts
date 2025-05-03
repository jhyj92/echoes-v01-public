// /pages/api/interviewer.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY! });
const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim());
let orIndex = 0;

function nextOrKey() {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return key;
}

async function fetchWithTimeout(url: string, opts: any = {}, ms = 10000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

const staticFallback = [
  "What motivates you in difficult times?",
  "How do you usually solve complex problems?",
  "What do your friends rely on you for?",
  "What activity makes you lose track of time?",
  "When do you feel most confident?",
  "What kind of challenges excite you?",
  "How do you recharge when you're drained?",
  "When have you surprised yourself?",
  "What is your greatest strength?",
  "What makes you uniquely you?",
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const messages = [
    {
      role: "system",
      content:
        "You are the Echoes Interviewer. Generate 10 insightful and personal questions to help someone discover their superpower. Keep them open-ended and non-generic. Do NOT repeat questions. Only output them as a numbered list without any other text.",
    },
  ];

  // Try Gemini first
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [messages.map((m) => m.content).join("\n")],
    });

    const result = response?.text?.trim();
    if (result) {
      const questions = result
        .split(/\n+/)
        .map((line) => line.replace(/^\d+\.?\s*/, "").trim())
        .filter(Boolean);
      if (questions.length >= 5) {
        return res.status(200).json({ questions });
      }
    }
  } catch {
    // ignore and fallback
  }

  // Try OpenRouter fallback
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages,
        temperature: 0.7,
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
      const reply = choices?.[0]?.message?.content?.trim();

      if (reply) {
        const questions = reply
          .split(/\n+/)
          .map((line) => line.replace(/^\d+\.?\s*/, "").trim())
          .filter(Boolean);
        if (questions.length >= 5) {
          return res.status(200).json({ questions });
        }
      }
    } catch {
      // ignore and continue
    }
  }

  // Fallback to static
  return res.status(200).json({ questions: staticFallback });
}
