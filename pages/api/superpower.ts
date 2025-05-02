// pages/api/superpower.ts

import type { NextApiRequest, NextApiResponse } from "next";
import genai from "google-generativeai";
import dotenv from "dotenv";
dotenv.config();

genai.configure({ api_key: process.env.GOOGLE_API_KEY });

import fetchWithTimeout from "@/utils/fetchWithTimeout";

const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);
let orIndex = 0;
function nextOrKey(): string {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return key;
}

type SPResponse = {
  superpower: string;
  description: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SPResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ superpower: "", description: "", error: "Method Not Allowed" });
  }

  const { domain, guideAnswers } = req.body as {
    domain?: string;
    guideAnswers?: string[];
  };
  if (typeof domain !== "string" || !Array.isArray(guideAnswers) || guideAnswers.length < 10) {
    return res.status(400).json({ superpower: "", description: "", error: "Invalid input" });
  }

  const bullets = guideAnswers.map((a, i) => `• ${i+1}. ${a}`).join("\n");
  const systemPrompt = `You are Echoes’ insightful narrator.`;
  const userPrompt = `
Domain: "${domain}"

Based on these user reflections:
${bullets}

Synthesize a JSON with "superpower" (one poetic label) and "description" (1–2 sentence evocative).
`;

  // Gemini primary
  try {
    const resp = await genai.generateMessage({
      model: "gemini-2.5-flash-preview-04-17",
      prompt: {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      },
      temperature: 0.75
    });
    const txt = resp.text.trim();
    try {
      const p = JSON.parse(txt);
      return res.status(200).json({ superpower: p.superpower, description: p.description });
    } catch {
      const spMatch = txt.match(/"superpower"\s*:\s*"([^"]+)"/);
      const descMatch = txt.match(/"description"\s*:\s*"([^"]+)"/);
      return res.status(200).json({
        superpower: spMatch?.[1] || "",
        description: descMatch?.[1] || ""
      });
    }
  } catch {
    // fallback OR
  }

  // OpenRouter fallback
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const resp = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${nextOrKey()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user",   content: userPrompt }
            ],
            temperature: 0.4
          })
        },
        10000
      );
      if (!resp.ok) continue;
      const j = await resp.json();
      const txt = j.choices?.[0]?.message?.content?.trim() || "";
      const spMatch = txt.match(/"superpower"\s*:\s*"([^"]+)"/);
      const descMatch = txt.match(/"description"\s*:\s*"([^"]+)"/);
      return res.status(200).json({
        superpower: spMatch?.[1] || "",
        description: descMatch?.[1] || ""
      });
    } catch {
      continue;
    }
  }

  return res.status(200).json({
    superpower: "Resonant Seeker",
    description: "You have an uncanny ability to find meaning and harmony where others see noise."
  });
}
