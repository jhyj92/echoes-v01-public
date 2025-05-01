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

async function fetchWithTimeout(url, opts = {}, ms = 10_000) {
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
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid prompt" });
  }

  const body = {
    model: "deepseek-chat-v3-0324:free",
    messages: [
      { role: "system", content: "You are a poetic interviewer for Echoes." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  };

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
          body: JSON.stringify(body),
        },
        10_000
      );
      if (!resp.ok) continue;
      const { choices } = await resp.json();
      const question = choices[0]?.message?.content?.trim();
      if (question) return res.status(200).json({ question });
    } catch {
      // next OR key
    }
  }

  // 2) Fallback: Gemini Flash Preview
  for (let j = 0; j < GM_KEYS.length; j++) {
    try {
      const resp = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-preview-04-17:generateMessage?key=${nextGmKey()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: { text: prompt }, temperature: 0.7 }),
        },
        10_000
      );
      if (!resp.ok) continue;
      const data = await resp.json();
      const question = data.candidates?.[0]?.content?.trim();
      if (question) return res.status(200).json({ question });
    } catch {
      // next Gemini key
    }
  }

  // 3) Hard fallback
  return res
    .status(200)
    .json({ question: "The echoes are silent for now…" });
}
