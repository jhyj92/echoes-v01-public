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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { idx, domain, reflections } = req.body;

  if (typeof idx !== "number" || typeof domain !== "string" || !Array.isArray(reflections)) {
    return res.status(400).json({ error: "Missing or invalid idx, domain, or reflections" });
  }

  const safeReflections = reflections.map((s: string) => s.replace(/[\r\n]+/g, " ").trim());

  const prompt = `
You are a wise and subtle guide within Echoes. You sense their superpower forming, yet incomplete. Begin softly - ask them to share what worlds inspire them: beloved movies, stories, or moments in history. From their answers, offer a few powerful figures in crisis - beings, real or imagined, who face great trials and who sense the user’s emerging power may help them. Speak naturally and invite collaboration - do not assign, but reveal.
  `.trim();

  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          { role: "system", content: "You are a wise and subtle guide within Echoes." },
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
        2000
      );

      if (!r.ok) continue;

      const { choices } = await r.json();
      const question = choices?.[0]?.message?.content?.trim();

      if (question) {
        return res.status(200).json({ question, modelUsed: "deepseek/deepseek-chat-v3-0324:free" });
      }
    } catch (error) {
      console.error("Deepseek error:", error);
    }
  }

  // Fallback question
  res.status(200).json({ question: "Reflect on a moment you felt truly aligned.", modelUsed: "hardcoded-fallback" });
}
