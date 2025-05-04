import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";
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

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY! });

async function fetchWithTimeout(url: string, opts: any = {}, ms = 2000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { idx, domain, reflections } = req.body;

  if (typeof idx !== "number" || typeof domain !== "string" || !Array.isArray(reflections)) {
    return res.status(400).json({ error: "Missing or invalid idx, domain, or reflections" });
  }

  const safeReflections = reflections.map((s: string) => s.replace(/[\r\n]+/g, " ").trim());

  const prompt = `
Invite me into a world where someone might need my help. Ask me a few questions to identify my favourite movies, books, TV shows, current events, and/or historical periods I admire. Use my preferences to suggest a few figures (real or fictional) who could be facing something difficult. These should feel like natural ideas, not extreme crises. Keep it conversational and warm - like brainstorming together. Let me choose or offer my own.

Domain: ${domain}
Reflections so far: ${safeReflections.join(" | ")}

Ask the next open-ended question (number ${idx + 1}) that invites me to share about stories or heroes I connect with. Return only the question, no extra commentary.
  `.trim();

  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          { role: "system", content: "You are Echoes, a thoughtful and gentle companion." },
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
        2000
      );

      if (!response.ok) continue;

      const json = await response.json();
      const question = json.choices?.[0]?.message?.content?.trim();

      if (question) {
        return res.status(200).json({ question, modelUsed: "deepseek/deepseek-chat-v3-0324:free" });
      }
    } catch (error) {
      console.error("Deepseek error:", error);
    }
  }

  // Fallback question
  return res.status(200).json({ question: "Reflect on a moment you felt truly aligned.", modelUsed: "hardcoded-fallback" });
}
