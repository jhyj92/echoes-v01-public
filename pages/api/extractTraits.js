// pages/api/extractTraits.js

import dotenv from "dotenv";
dotenv.config();

const OPENROUTER_KEYS = (process.env.OPENROUTER_KEYS || "").split(",");
let keyIndex = 0;
function nextKey() {
  const key = OPENROUTER_KEYS[keyIndex % OPENROUTER_KEYS.length].trim();
  keyIndex += 1;
  return key;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const { userInput } = req.body || {};
  if (!userInput || typeof userInput !== "string") {
    return res.status(400).json({ error: "Invalid input" });
  }

  const body = {
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [
      {
        role: "system",
        content:
          "You are a master trait extractor. Output EXACTLY 3 traits as a comma-separated list, no commentary."
      },
      { role: "user", content: userInput }
    ],
    temperature: 0.2
  };

  for (let i = 0; i < OPENROUTER_KEYS.length; i++) {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${nextKey()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (resp.ok) {
      const data   = await resp.json();
      const traits = (data?.choices?.[0]?.message?.content || "")
        .replace(/\n+/g, "")
        .trim();
      return res.status(200).json({ traits });
    }
  }
  console.error("All OpenRouter keys failed");
  // friendly fallback
  return res.status(200).json({ traits: "Curiosity, Courage, Reflection" });
}
