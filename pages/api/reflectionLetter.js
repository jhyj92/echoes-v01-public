// pages/api/reflectionLetter.js

import dotenv from "dotenv";
dotenv.config();

const OR_KEYS = (process.env.OPENROUTER_KEYS || "").split(",").map(k=>k.trim());
const GM_KEYS = (process.env.GEMINI_KEYS || "").split(",").map(k=>k.trim());
let orI = 0, gmI = 0;
const nextOrKey = () => OR_KEYS[orI++ % OR_KEYS.length];
const nextGmKey = () => GM_KEYS[gmI++ % GM_KEYS.length];

async function fetchWithTimeout(url, opts = {}, ms = 12000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, {...opts, signal: ctrl.signal}); }
  finally { clearTimeout(id); }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { scenario, answers, heroMessages } = req.body || {};
  if (!scenario || !answers || !heroMessages)
    return res.status(400).json({ error: "Missing scenario, answers or heroMessages" });

  // Build prompt for reflection letter
  const summary = `Scenario: ${scenario}\nYour answers: ${answers.join(" | ")}\n` +
                  `Conversation (hero messages): ${heroMessages.join(" | ")}`;
  const prompt = `Write a poetic letter from the hero reflecting on your superpower. ` +
                 `How has the conversation changed their view? What advice do they give?`;

  const orBody = {
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [
      { role: "system", content: "You are a reflective hero composing a letter." },
      { role: "user", content: `${summary}\n\n${prompt}` },
    ],
    temperature: 0.7,
  };

  // Try OpenRouter
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const r = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method:"POST",
          headers:{
            Authorization:`Bearer ${nextOrKey()}`,
            "Content-Type":"application/json"
          },
          body: JSON.stringify(orBody)
        },
        12000
      );
      if (!r.ok) continue;
      const { choices } = await r.json();
      return res.status(200).json({ letter: choices[0].message.content.trim() });
    } catch {}
  }

  // Fallback to Gemini Pro
  for (let j = 0; j < GM_KEYS.length; j++) {
    try {
      const r = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateMessage?key=${nextGmKey()}`,
        {
          method:"POST",
          headers: { "Content-Type":"application/json" },
          body: JSON.stringify({
            prompt: { text: `${summary}\n\n${prompt}` },
            temperature: 0.7
          }),
        },
        12000
      );
      if (!r.ok) continue;
      const data = await r.json();
      const text = data.candidates?.[0]?.content?.trim();
      if (text) return res.status(200).json({ letter: text });
    } catch {}
  }

  // Ultimate fallback
  return res.status(500).json({
    letter: "The hero’s pen hovers, then falls still. Their thoughts remain unspoken…"
  });
}
