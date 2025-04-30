import dotenv from "dotenv";
dotenv.config();

const KEYS = (process.env.OPENROUTER_KEYS || "").split(",").map((k) => k.trim());
let i = 0;
const nextKey = () => KEYS[i++ % KEYS.length];

export default async function handler(req, res) {
  const { domain, prompt } = req.body || {};
  if (!domain || !prompt) return res.status(400).end();

  const body = {
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [
      { role: "system", content: "You are a poetic narrative generator." },
      { role: "user", content: `Domain "${domain}". ${prompt}` },
    ],
    temperature: 0.7,
  };

  for (let k = 0; k < KEYS.length; k++) {
    try {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${nextKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!r.ok) continue;
      const { choices } = await r.json();
      const scenarios = choices[0].message.content
        .split("\n")
        .map((l) => l.replace(/^[0-9]+\.\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 3);
      return res.status(200).json({ scenarios });
    } catch (e) {
      console.error(e);
    }
  }
  return res.status(200).json({
    scenarios: [
      "A starlit path appears…",
      "A whisper draws you…",
      "A mirror ripples…",
    ],
  });
}
