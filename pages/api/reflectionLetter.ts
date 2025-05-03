// /pages/api/reflectionLetter.ts
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

  const { history, superpower } = req.body;

  if (!Array.isArray(history) || !superpower || typeof superpower !== "string") {
    return res.status(400).json({ error: "Missing or invalid history or superpower." });
  }

  const dialogue = history
    .map((h: any) => `${h.from === "hero" ? "Hero" : "You"}: ${h.text}`)
    .join("\n");

  const messages = [
    { role: "system", content: `Superpower: ${superpower}` },
    {
      role: "user",
      content: `The journey so far:\n\n${dialogue}\n\nWrite a reflective letter from the hero to the user about their journey and their superpower.`,
    },
  ];

  // Try Gemini first
  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [messages.map((m) => m.content).join("\n")],
    });

    if (resp?.text?.trim()) {
      return res.status(200).json({ letter: resp.text.trim() });
    }
  } catch {
    // Gemini failed → fallback
  }

  // Fallback OpenRouter
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
        return res.status(200).json({ letter: reply });
      }
    } catch {
      // Ignore and continue fallback
    }
  }

  // Total failure fallback
  return res.status(200).json({
    letter:
      "Dear wanderer,\n\nThough the path was fraught with silence, your resolve never wavered. In you, the hero sees the quiet strength that shapes worlds unseen. Until our paths cross again — carry your superpower with grace.\n\n— The Hero",
  });
}
