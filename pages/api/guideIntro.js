// pages/api/guideIntro.js

import dotenv from "dotenv";
dotenv.config();

const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

const GM_KEYS = (process.env.GEMINI_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

let orIndex = 0, gmIndex = 0;
const nextOrKey = () => OR_KEYS[orIndex++ % OR_KEYS.length];
const nextGmKey = () => GM_KEYS[gmIndex++ % GM_KEYS.length];

async function fetchWithTimeout(url, opts = {}, ms = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const { domain, prompt } = req.body || {};
  if (!domain || !prompt) {
    return res.status(400).json({ error: "Missing domain or prompt" });
  }

  const instruction = `Domain "${domain}". ${prompt}`;
  const orPayload = {
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [
      { role: "system", content: "You are a poetic narrative generator." },
      { role: "user", content: instruction },
    ],
    temperature: 0.7,
  };

  // 1) OpenRouter (DeepSeek)
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
          body: JSON.stringify(orPayload),
        },
        10000
      );
      if (!r.ok) continue;
      const { choices } = await r.json();
      const scenarios = choices[0].message.content
        .split(/\r?\n/)
        .map((l) => l.replace(/^[0-9]+\.\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 3);
      return res.status(200).json({ scenarios });
    } catch {
      // try next OR key
    }
  }

  // 2) Gemini Flash fallback
  for (let j = 0; j < GM_KEYS.length; j++) {
    try {
      const r = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1/models/chat-bison-001:generateMessage?key=${nextGmKey()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: { text: instruction },
            temperature: 0.7,
          }),
        },
        8000
      );
      if (!r.ok) continue;
      const data = await r.json();
      const scenarios = (data.candidates?.[0]?.content || "")
        .split(/\r?\n/)
        .map((l) => l.replace(/^[0-9]+\.\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 3);
      return res.status(200).json({ scenarios });
    } catch {
      // try next Gemini key
    }
  }

  // 3) Ultimate fallback
  return res.status(200).json({
    scenarios: [
      "A starlit path appears…",
      "A whisper draws you…",
      "A mirror ripples…",
    ],
  });
}
