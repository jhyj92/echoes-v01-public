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

  const { scenario, history } = req.body;
  if (typeof scenario !== "string" || !Array.isArray(history)) {
    return res.status(400).json({ error: "Missing scenario or history" });
  }

  // Sanitize history
  const safeHistory = history.map((m: any) =>
    `${m.from}: ${String(m.text).replace(/[\r\n]+/g, " ").trim()}`
  );

  // New poetic letter prompt
  const prompt = `
You are [Hero Name], and the time for words has come. Speak to the user as though they are no longer simply a helper, but a part of your story. Share how you first perceived their emerging gift, and how - through your exchanges - that perception deepened and transformed. Express gratitude for the unexpected ways they shaped your path. Reflect gently on how their superpower may continue to grow and touch both your world and others. Let your words feel personal, poetic, and timeless. Do not summarize mechanically. Instead, offer this letter as though it were left at the edge of a dream - tender, insightful, and quietly hopeful. Conclude softly, leaving the door open for future reunion, without making promises or breaking the reverie.

Scenario: ${scenario}
${safeHistory.join('\n')}
`.trim();

  // 1️⃣ Primary: OpenRouter deepseek-chat-v3-0324:free
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          { role: "system", content: "You are a poetic letter writer." },
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
      if (choices?.[0]?.message?.content?.trim()) {
        return res.status(200).json({ letter: choices[0].message.content.trim(), modelUsed: "deepseek/deepseek-chat-v3-0324:free" });
      }
    } catch (error) {
      console.error("Deepseek error:", error);
    }
  }

  // 2️⃣ Secondary: Gemini 2.0 Flash Lite
  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [prompt],
    });

    if (resp?.text?.trim()) {
      return res.status(200).json({ letter: resp.text.trim(), modelUsed: "gemini-2.0-flash-lite" });
    }
  } catch (error) {
    console.error("Gemini 2.0 error:", error);
  }

  // 3️⃣ Tertiary: OpenRouter meta-llama/llama-4-scout:free
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "meta-llama/llama-4-scout:free",
        messages: [
          { role: "system", content: "You are a poetic letter writer." },
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
      if (choices?.[0]?.message?.content?.trim()) {
        return res.status(200).json({ letter: choices[0].message.content.trim(), modelUsed: "meta-llama/llama-4-scout:free" });
      }
    } catch (error) {
      console.error("Llama-4-Scout error:", error);
    }
  }

  // 4️⃣ Hard fallback
  res.status(200).json({
    letter: "Your courage has illuminated every step…",
    modelUsed: "hardcoded-fallback",
  });
}
