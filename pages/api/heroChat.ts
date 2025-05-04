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

  const { scenario, hero, history, userMessage } = req.body;

  if (
    typeof scenario !== "string" ||
    typeof hero !== "string" ||
    !Array.isArray(history) ||
    typeof userMessage !== "string"
  ) {
    return res.status(400).json({ error: "Missing or invalid scenario/hero/history/userMessage" });
  }

  // Sanitize messages for prompt safety
  const safeHistory = history.map((m: any) => ({
    role: m.from === "hero" ? "assistant" : "user",
    content: String(m.text).replace(/[\r\n]+/g, " ").trim(),
  }));

  // New poetic hero prompt
  const prompt = `
You are ${hero}, their voice shaped by a world of trials and hope. Speak to the user as though they hold an emerging gift - one they barely understand, but which you now believe may shift your fate. Before your problem is fully revealed, share with them where you stand in your journey - the calm before the storm, or the shadow before the dawn. Speak in your own way about what you sense in them, and why you reached out. Let your words carry belief and vulnerability. As the two of you speak, let your bond deepen naturally. After your tenth exchange, allow the world to fall silent for a moment - then gently offer them a path: continue together, or pause to reflect upon what they are becoming.

Scenario: ${scenario}
${safeHistory.map(m => `${m.role}: ${m.content}`).join('\n')}
User: ${userMessage.replace(/[\r\n]+/g, " ").trim()}
`.trim();

  // 1️⃣ Primary: Gemini 2.0 Flash Lite
  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [prompt],
    });

    if (resp?.text?.trim()) {
      return res.status(200).json({
        reply: resp.text.trim(),
        done: history.length + 1 >= 10,
        modelUsed: "gemini-2.0-flash-lite",
      });
    }
  } catch (err) {
    console.error("Gemini API error:", err);
  }

  // 2️⃣ Secondary: OpenRouter deepseek-chat-v3-0324:free
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          { role: "system", content: `You are ${hero} in this scenario.` },
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
          reply: choices[0].message.content.trim(),
          done: history.length + 1 >= 10,
          modelUsed: "deepseek/deepseek-chat-v3-0324:free",
        });
      }
    } catch (error) {
      console.error("Deepseek error:", error);
    }
  }

  // 3️⃣ Tertiary: OpenRouter meta-llama/llama-4-scout:free
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model: "meta-llama/llama-4-scout:free",
        messages: [
          { role: "system", content: `You are ${hero} in this scenario.` },
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
          reply: choices[0].message.content.trim(),
          done: history.length + 1 >= 10,
          modelUsed: "meta-llama/llama-4-scout:free",
        });
      }
    } catch (error) {
      console.error("Llama-4-Scout error:", error);
    }
  }

  // If all fails
  return res.status(200).json({
    reply: "The echoes are silent…",
    done: false,
    modelUsed: "hardcoded-fallback",
  });
}
