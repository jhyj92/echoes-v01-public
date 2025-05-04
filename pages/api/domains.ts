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

  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "Missing or invalid answers" });
  }

  const safeAnswers = answers.map((s: string) => s.replace(/[\r\n]+/g, " ").trim());

  const prompt = `
You now hold an impression of the user’s deepest resonances. From this, reveal five poetic and mysterious domains - symbolic paths they may step into, each reflecting a subtle facet of their personal strength. Let your words inspire wonder and invitation, not merely description.

Here are their answers: ${safeAnswers.join(" | ")}

Return just a list of five poetic domains, separated by line breaks or commas. No meta commentary.
  `.trim();

  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "meta-llama/llama-4-scout:free",
        messages: [
          { role: "system", content: "You are the quiet voice of Echoes." },
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
      const content = json.choices?.[0]?.message?.content;
      if (typeof content === "string") {
        const list = content
          .split(/[\r\n,]+/)
          .map((s: string) => s.trim())
          .filter(Boolean)
          .slice(0, 5);

        if (list.length > 0) {
          return res.status(200).json({ suggestions: list, modelUsed: "meta-llama/llama-4-scout:free" });
        }
      }
    } catch (error) {
      console.error("Llama-4-Scout error:", error);
    }
  }

  // Fallback domains
  return res.status(200).json({
    suggestions: ["Curiosity", "Courage", "Reflection", "Discovery", "Wonder"],
    modelUsed: "hardcoded-fallback",
  });
}
