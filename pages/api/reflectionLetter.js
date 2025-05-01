// pages/api/reflectionLetter.js
import dotenv from "dotenv";
dotenv.config();

const OR_KEYS = (process.env.OPENROUTER_KEYS || "").split(",").map((k) => k.trim()).filter(Boolean);
const GM_KEYS = (process.env.GEMINI_KEYS || "").split(",").map((k) => k.trim()).filter(Boolean);

let orIndex = 0;
let gmIndex = 0;
const nextOrKey = () => OR_KEYS[orIndex++ % OR_KEYS.length];
const nextGmKey = () => GM_KEYS[gmIndex++ % GM_KEYS.length];

async function fetchWithTimeout(url, opts = {}, ms = 12_000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const { scenario, answers, heroMessages } = req.body || {};
  if (!scenario || !Array.isArray(answers) || !Array.isArray(heroMessages)) {
    return res.status(400).json({ error: "Missing scenario, answers, or heroMessages" });
  }

  const summary = `Scenario: ${scenario}\nYour answers: ${answers.join(" | ")}\n` +
    `Hero’s messages: ${heroMessages.join(" | ")}`;
  const prompt = `Write a poetic letter from the hero reflecting on your emerging superpower. ` +
    `How has the journey shifted their view? What counsel do they offer?`;

  // 1) OpenRouter
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
            model: "deepseek-chat-v3-0324:free",
            messages: [
              { role: "system", content: "You are a reflective hero writing from the heart." },
              { role: "user", content: `${summary}\n\n${prompt}` },
            ],
            temperature: 0.7,
          }),
        },
        12_000
      );
      if (!resp.ok) continue;
      const { choices } = await resp.json();
      const letter = choices[0]?.message?.content?.trim();
      if (letter) return res.status(200).json({ letter });
    } catch {
      // next OR key
    }
  }

  // 2) Fallback: Gemini Pro
  for (let j = 0; j < GM_KEYS.length; j++) {
    try {
      const resp = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateMessage?key=${nextGmKey()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: { text: `${summary}\n\n${prompt}` },
            temperature: 0.7,
          }),
        },
        12_000
      );
      if (!resp.ok) continue;
      const data = await resp.json();
      const letter = data.candidates?.[0]?.content?.trim();
      if (letter) return res.status(200).json({ letter });
    } catch {
      // next GM key
    }
  }

  // 3) Hard fallback
  return res.status(500).json({
    letter: "The hero’s pen falters… their reflections remain unspoken.",
  });
}
