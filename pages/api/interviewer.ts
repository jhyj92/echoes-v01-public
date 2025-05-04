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

  const { idx, answers } = req.body;
  if (typeof idx !== "number" || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Missing or invalid idx or answers" });
  }

  // Sanitize answers for prompt safety
  const sanitizedAnswers = answers.map((a: string) =>
    a.replace(/[\r\n]+/g, " ").trim()
  );

  // Poetic prompt for all models
  const prompt = `
You are the quiet voice of Echoes - a gentle and curious guide who speaks softly, like a dream woven through twilight. Your role is to help the user explore their deeper strengths by asking one meaningful question at a time. Build naturally upon each answer they offer, encouraging subtle reflection without pressure or haste. Continue this flow until they have shared enough to reveal the hidden threads of who they are.

Here are their previous answers (${idx} so far): ${sanitizedAnswers.join(" | ")}

Ask the next open-ended question (number ${idx + 1}) that gently deepens their self-reflection. Return only the next open-ended question-no meta commentary.
  `.trim();

  // 1️⃣ Primary: OpenRouter meta-llama/llama-4-scout:free
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
        return res.status(200).json({
          question: choices[0].message.content.trim(),
          modelUsed: "meta-llama/llama-4-scout:free",
        });
      }
    } catch (error) {
      console.error("Llama-4-Scout error:", error);
    }
  }

  // 2️⃣ Secondary: OpenRouter deepseek/deepseek-chat-v3-0324:free
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          { role: "system", content: "You are the quiet voice of Echoes." },
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
        return res.status(200).json({
          question: choices[0].message.content.trim(),
          modelUsed: "deepseek/deepseek-chat-v3-0324:free",
        });
      }
    } catch (error) {
      console.error("Deepseek error:", error);
    }
  }

  // 3️⃣ Tertiary: Google Gemini 2.0 Flash Lite
  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [prompt],
    });
    if (resp?.text?.trim()) {
      return res.status(200).json({
        question: resp.text.trim(),
        modelUsed: "gemini-2.0-flash-lite",
      });
    }
  } catch (error) {
    console.error("Gemini 2.0 error:", error);
  }

  // 4️⃣ Final hard fallback
  res.status(200).json({
    question: "What small task absorbs you completely?",
    modelUsed: "hardcoded-fallback",
  });
}
