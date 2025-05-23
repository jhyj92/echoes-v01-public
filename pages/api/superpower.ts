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

  const { domain, reflections } = req.body;
  if (typeof domain !== "string" || !Array.isArray(reflections)) {
    return res.status(400).json({ error: "Missing domain or reflections" });
  }

  // Sanitize reflections
  const safeReflections = reflections.map((s: string) => s.replace(/[\r\n]+/g, " ").trim());

  const prompt = `
Listening to these reflections and my chosen domain "${domain}", what is the personal gift you sense in me? Express it in a single, poetic phrase-something I could carry with me. Just the phrase, as if spoken softly by someone who sees me well.
${safeReflections.join(" | ")}
  `.trim();

  // 1️⃣ Gemini primary
  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [prompt],
    });

    if (resp?.text?.trim()) {
      return res.status(200).json({ superpower: resp.text.trim() });
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    // Fall through
  }

  // 2️⃣ OpenRouter fallback
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          { role: "system", content: "You are a superpower synthesizer." },
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
      if (choices?.[0]?.message?.content?.trim()) {
        return res.status(200).json({ superpower: choices[0].message.content.trim() });
      }
    } catch (error) {
      console.error("OpenRouter fallback error:", error);
    }
  }

  // 3️⃣ Final hard fallback
  res.status(200).json({ superpower: "The Whispering Architect" });
}
