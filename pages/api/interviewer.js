// pages/api/interviewer.js

import dotenv from "dotenv";
dotenv.config();

const OR_KEYS = (process.env.OPENROUTER_KEYS || "").split(",").map(k => k.trim());
const GM_KEYS = (process.env.GEMINI_KEYS || "").split(",").map(k => k.trim());

let orIndex = 0, gmIndex = 0;
function nextOrKey() {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex += 1;
  return key;
}
function nextGmKey() {
  const key = GM_KEYS[gmIndex % GM_KEYS.length];
  gmIndex += 1;
  return key;
}

async function fetchWithTimeout(url, options = {}, ms = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const body = {
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [
      { role: "system", content: "You are a poetic interviewer." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  };

  // Try OpenRouter keys first
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
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
        10000
      );
      if (!response.ok) continue;
      const { choices } = await response.json();
      return res.status(200).json({ question: choices[0].message.content.trim() });
    } catch (e) {
      // try next key
    }
  }

  // Fallback to Gemini Flash
  for (let j = 0; j < GM_KEYS.length; j++) {
    try {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1/models/chat-bison-001:generateMessage?key=${nextGmKey()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: { text: prompt },
            temperature: 0.7,
          }),
        },
        10000
      );
      if (!response.ok) continue;
      const data = await response.json();
      const question = data.candidates?.[0]?.content?.trim();
      if (question) {
        return res.status(200).json({ question });
      }
    } catch {
      // try next Gemini key
    }
  }

  // Ultimate fallback
  return res.status(200).json({ question: "The echoes are quiet right now..." });
}
