// pages/api/extractTraits.js

import dotenv from "dotenv";
dotenv.config();

// Load comma-separated keys or single key
const OPENROUTER_KEYS = (process.env.OPENROUTER_KEYS || process.env.OPENROUTER_KEY_1 || "").split(",").map(k => k.trim());
let keyIndex = 0;

function nextKey() {
  const key = OPENROUTER_KEYS[keyIndex % OPENROUTER_KEYS.length];
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

  // Try each API key once
  for (let i = 0; i < OPENROUTER_KEYS.length; i++) {
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${nextKey()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!resp.ok) {
        // Log and continue to next key
        console.warn(`OpenRouter key failed (${resp.status}). Trying next key.`);
        continue;
      }

      const data   = await resp.json();
      const traits = (data?.choices?.[0]?.message?.content || "")
        .replace(/\n+/g, "")
        .trim();

      return res.status(200).json({ traits });
    } catch (err) {
      console.error("Fetch error:", err);
      // continue to next key
    }
  }

  // Fallback if all keys fail
  const fallback = "curiosity, courage, reflection";
  console.error("All OpenRouter keys exhausted or failed. Returning fallback traits.");
  return res.status(200).json({ traits: fallback });
}
