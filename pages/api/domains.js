// pages/api/domains.js

import dotenv from "dotenv";
dotenv.config();

const OR_KEYS = (process.env.OPENROUTER_KEYS || "").split(",").map(k => k.trim());
const GM_KEYS = (process.env.GEMINI_KEYS || "").split(",").map(k => k.trim());
let orIndex = 0, gmIndex = 0;
function nextOrKey() { const k = OR_KEYS[orIndex % OR_KEYS.length]; orIndex++; return k; }
function nextGmKey() { const k = GM_KEYS[gmIndex % GM_KEYS.length]; gmIndex++; return k; }

async function fetchWithTimeout(url, options = {}, ms = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(id); }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { answers } = req.body || {};
  if (!answers?.length) return res.status(400).json({ error: "Missing answers" });

  const prompt = `Based on these answers: ${answers.join(", ")}, suggest 5 nuanced superpower domains.`;
  const body = {
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [
      { role: "system", content: "You are an insightful domain suggester." },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
  };

  // OpenRouter
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const response = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${nextOrKey()}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
        10000
      );
      if (!response.ok) continue;
      const { choices } = await response.json();
      const text = choices[0].message.content;
      const suggestions = text
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5);
      return res.status(200).json({ suggestions });
    } catch {}
  }

  // Gemini Flash fallback
  for (let j = 0; j < GM_KEYS.length; j++) {
    try {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1/models/chat-bison-001:generateMessage?key=${nextGmKey()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: { text: prompt }, temperature: 0.8 }),
        },
        10000
      );
      if (!response.ok) continue;
      const data = await response.json();
      const text = data.candidates?.[0]?.content || "";
      const suggestions = text
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5);
      return res.status(200).json({ suggestions });
    } catch {}
  }

  // Fallback list
  return res.status(200).json({ suggestions: ["Curiosity","Courage","Reflection","Discovery","Wonder"] });
}
