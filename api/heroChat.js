// pages/api/heroChat.js

import dotenv from "dotenv";
dotenv.config();

const OR_KEYS = (process.env.OPENROUTER_KEYS || "").split(",").map(k => k.trim());
const GM_KEYS = (process.env.GEMINI_KEYS || "").split(",").map(k => k.trim());
let orIndex = 0, gmIndex = 0;
function nextOrKey() { const k = OR_KEYS[orIndex % OR_KEYS.length]; orIndex++; return k; }
function nextGmKey() { const k = GM_KEYS[gmIndex % GM_KEYS.length]; gmIndex++; return k; }

async function fetchWithTimeout(url, options = {}, ms = 12000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(id); }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const body = {
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [
      { role: "system", content: "You are a heroic mentor." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    stream: false,
  };

  // Try OpenRouter
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
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
        12000
      );
      if (!r.ok) continue;
      const { choices } = await r.json();
      return res.status(200).json({ reply: choices[0].message.content.trim() });
    } catch {}
  }

  // Fallback to Gemini Pro
  for (let j = 0; j < GM_KEYS.length; j++) {
    try {
      const r = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateMessage?key=${nextGmKey()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: { text: prompt },
            temperature: 0.7,
          }),
        },
        12000
      );
      if (!r.ok) continue;
      const data = await r.json();
      const reply = data.candidates?.[0]?.content?.trim();
      if (reply) return res.status(200).json({ reply });
    } catch {}
  }

  // Ultimate fallback
  return res.status(500).json({ reply: "The hero’s heart is silent…" });
}
