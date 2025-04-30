// pages/api/extractTraits.js

import dotenv from "dotenv";
dotenv.config();

const OR_KEYS = (process.env.OPENROUTER_KEYS || process.env.OPENROUTER_KEY_1 || "")
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
  const { userInput } = req.body || {};
  if (!userInput || typeof userInput !== "string") {
    return res.status(400).json({ error: "Invalid input" });
  }

  const payload = {
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [
      {
        role: "system",
        content:
          "You are a master trait extractor. Output EXACTLY 3 traits as a comma-separated list, no commentary.",
      },
      { role: "user", content: userInput },
    ],
    temperature: 0.2,
  };

  // 1) Try DeepSeek (OpenRouter) keys
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
          body: JSON.stringify(payload),
        },
        10000
      );
      if (!resp.ok) continue;
      const data = await resp.json();
      const traits = (data.choices?.[0]?.message?.content || "")
        .replace(/\n+/g, "")
        .trim();
      return res.status(200).json({ traits });
    } catch {
      // try next key
    }
  }

  // 2) Fallback to Gemini Flash
  for (let j = 0; j < GM_KEYS.length; j++) {
    try {
      const resp = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1/models/chat-bison-001:generateMessage?key=${nextGmKey()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: { text: userInput },
            temperature: 0.2,
          }),
        },
        8000
      );
      if (!resp.ok) continue;
      const data = await resp.json();
      const traits = (data.candidates?.[0]?.content || "")
        .replace(/\n+/g, "")
        .trim();
      return res.status(200).json({ traits });
    } catch {
      // try next Gemini key
    }
  }

  // 3) Ultimate fallback
  console.error("All extraction keys failed; returning default traits.");
  return res.status(200).json({ traits: "curiosity, courage, reflection" });
}
