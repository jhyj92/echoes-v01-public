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

function sanitizeInput(input: string): string {
  return input.replace(/[\r\n]+/g, " ").trim();
}

function buildDomainsPrompt(answers: string[]): string {
  const sanitizedAnswers = answers.map(sanitizeInput);
  return `
You know me a little now. Based on what I shared, offer five simple but meaningful domains that might describe where my quiet strengths live. These should feel like areas I could explore, not labels or tests. Use short, evocative phrases that sound personal and inviting - not overly grand or dramatic.

Here are my answers: ${sanitizedAnswers.join(" | ")}

List five domains as short, inviting phrases.
  `.trim();
}

async function callOpenRouterModel(model: string, prompt: string, timeout = 2000): Promise<string | null> {
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model,
        messages: [
          { role: "system", content: "You are the quiet voice of Echoes." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      };
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${nextOrKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeout),
      });
      if (!res.ok) continue;
      const json = await res.json();
      const content = json.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    } catch (e) {
      console.error(`OpenRouter model ${model} error:`, e);
    }
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { answers } = req.body;
  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: "Missing or invalid answers" });
  }

  const prompt = buildDomainsPrompt(answers);

  // Try OpenRouter meta-llama/llama-4-scout first
  let response = await callOpenRouterModel("meta-llama/llama-4-scout:free", prompt);
  if (!response) {
    // Try OpenRouter deepseek
    response = await callOpenRouterModel("deepseek/deepseek-chat-v3-0324:free", prompt);
  }

  // Try Google Gemini 2.0 Flash Lite
  if (!response) {
    try {
      const resp = await gemini.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: [prompt],
      });
      if (resp?.text?.trim()) {
        response = resp.text.trim();
      }
    } catch (error) {
      console.error("Gemini 2.0 error:", error);
    }
  }

  // If no AI response, fallback to default domains
  if (!response) {
    return res.status(200).json({
      suggestions: [
        "Curiosity",
        "Courage",
        "Reflection",
        "Discovery",
        "Wonder",
      ],
      modelUsed: "hardcoded-fallback",
    });
  }

  // Parse response into array of domains (split by line breaks or commas)
  const suggestions = response
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 5);

  return res.status(200).json({ suggestions, modelUsed: "ai-generated" });
}
