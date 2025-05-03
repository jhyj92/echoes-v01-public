// /pages/api/superpower.ts
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

  const { domain, guideAnswers } = req.body;

  if (typeof domain !== "string" || !Array.isArray(guideAnswers) || guideAnswers.length === 0) {
    return res.status(400).json({ error: "Missing or invalid domain or guideAnswers." });
  }

  const messages = [
    { role: "system", content: `Domain: ${domain}` },
    {
      role: "user",
      content: `Based on my journey through this domain, here are my reflections:\n\n${guideAnswers.join(
        "\n"
      )}\n\nPlease summarize my core superpower and describe it poetically in 1-2 sentences.`,
    },
  ];

  // Try Gemini first
  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [messages.map((m) => m.content).join("\n")],
    });

    if (resp?.text?.trim()) {
      const [superpowerLine, ...descLines] = resp.text.trim().split("\n");
      return res.status(200).json({
        superpower: superpowerLine.trim(),
        description: descLines.join("\n").trim(),
      });
    }
  } catch {
    // Gemini failed -> fallback
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
        const [superpowerLine, ...descLines] = reply.split("\n");
        return res.status(200).json({
          superpower: superpowerLine.trim(),
          description: descLines.join("\n").trim(),
        });
      }
    } catch {
      // Ignore and continue fallback
    }
  }

  // If everything fails
  return res.status(200).json({
    superpower: "The Silent Echo",
    description: "A mysterious and unspoken strength that only emerges when words fade.",
  });
}
