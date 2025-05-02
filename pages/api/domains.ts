// pages/api/domains.ts

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

type DomainsResponse = {
  suggestions: string[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DomainsResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ suggestions: [], error: "Method Not Allowed" });
  }

  const { answers } = req.body as { answers?: string[] };
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ suggestions: [], error: "Missing answers" });
  }

  const prompt = `
Based on these ten answers:
${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}

Suggest exactly five poetic “superpower domains.” 
Each should be a short, evocative label (e.g., "Weaver of Connections"). 
Return as a JSON array of strings.
`;

  // 1) Gemini primary
  try {
    const response = await genai.generateMessage({
      model: "gemini-2.5-flash-preview-04-17",
      prompt: { messages: [
        { role: "system", content: "You are an insightful domain suggester." },
        { role: "user", content: prompt.trim() },
      ] },
      temperature: 0.8,
    });
    const raw = response.text.trim();
    try {
      const parsed: string[] = JSON.parse(raw);
      return res.status(200).json({ suggestions: parsed.slice(0, 5) });
    } catch {
      const items = raw
        .replace(/[\[\]]/g, "")
        .split(/[,\\n]/)
        .map((s) => s.trim().replace(/["']/g, ""))
        .filter(Boolean);
      return res.status(200).json({ suggestions: items.slice(0, 5) });
    }
  } catch {
    // fall through to OpenRouter
  }

  // 2) OpenRouter fallback
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const resp = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${nextOrKey()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: [
              { role: "system", content: "You are an insightful domain suggester." },
              { role: "user",   content: prompt.trim() },
            ],
            temperature: 0.8,
          }),
        },
        10000
      );
      if (!resp.ok) continue;
      const json = await resp.json();
      const raw = json.choices?.[0]?.message?.content?.trim() || "";
      const items = raw
        .replace(/[\[\]]/g, "")
        .split(/[,\\n]/)
        .map((s: string) => s.trim().replace(/["']/g, ""))
        .filter(Boolean);
      return res.status(200).json({ suggestions: items.slice(0, 5) });
    } catch {
      continue;
    }
  }

  // Static fallback
  return res.status(200).json({
    suggestions: ["Curiosity Weave","Resonant Strategist","Empathic Connector","Philosophical Alchemist","Mystic Mirror"]
  });
}
