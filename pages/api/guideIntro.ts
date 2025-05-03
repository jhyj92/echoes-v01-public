// pages/api/guideIntro.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// OpenRouter key rotation
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

  const { idx, domain, reflections } = req.body;

  if (
    typeof idx !== "number" ||
    typeof domain !== "string" ||
    !Array.isArray(reflections)
  ) {
    return res.status(400).json({ error: "Missing idx, domain or reflections" });
  }

  const prompt = `
You are Echoes, a poetic guide. The user selected domain "${domain}"—a hidden
strength. Based on their previous ${idx} reflections:
${reflections.join(" | ")}, ask reflection question ${idx + 1}/10
that explores the essence of this domain. Return only the next question.
  `.trim();

  // 1️⃣ Gemini primary
  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [prompt],
    });

    if (resp && resp.text) {
      return res.status(200).json({ question: resp.text.trim() });
    }
  } catch {
    // fallthrough to OpenRouter
  }

  // 2️⃣ OpenRouter fallback
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          { role: "system", content: "You are a poetic domain explorer." },
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
      const question = choices?.[0]?.message?.content?.trim();

      if (question) {
        return res.status(200).json({ question });
      }
    } catch {
      // failover
    }
  }

  // 3️⃣ Hardcoded final fallback
  res
    .status(200)
    .json({ question: "Reflect on a moment you felt truly aligned." });
}
