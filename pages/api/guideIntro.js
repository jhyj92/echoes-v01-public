// pages/api/guideIntro.js

import dotenv from "dotenv";
dotenv.config();

const OPENROUTER_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim());
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
  const { domain, prompt } = req.body || {};
  if (!domain || !prompt) {
    return res.status(400).json({ error: "Missing domain or prompt" });
  }

  const body = {
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [
      { role: "system", content: "You are a poetic narrative generator." },
      {
        role: "user",
        content: `Domain: "${domain}". ${prompt} Provide exactly 3 distinct narrative entry points.`,
      },
    ],
    temperature: 0.7,
  };

  for (let i = 0; i < OPENROUTER_KEYS.length; i++) {
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${nextKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        console.warn(`Key failed (${resp.status}). Trying next.`);
        continue;
      }
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content || "";
      // split into 3 scenarios
      const scenarios = content
        .split("\n")
        .map((s) => s.replace(/^[0-9]+\.\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 3);
      return res.status(200).json({ scenarios });
    } catch (err) {
      console.error("Fetch error:", err);
      // continue to next key
    }
  }

  console.error("All keys failed for guideIntro");
  return res.status(200).json({
    scenarios: [
      "A starlit path appears…",
      "A whisper draws you…",
      "A mirror ripples…",
    ],
  });
}
