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
  const { userInput } = req.body || {};
  if (!userInput || typeof userInput !== "string") {
    return res.status(400).json({ error: "Invalid or missing userInput" });
  }

  const payload = {
    model: "deepseek-chat-v3-0324:free",
    messages: [
      {
        role: "system",
        content:
          "You are a master trait extractor. Output EXACTLY three short traits as a comma-separated list—no commentary.",
      },
      { role: "user", content: userInput },
    ],
    temperature: 0.2,
  };

  // 1) Try OpenRouter / DeepSeek
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
        10_000
      );
      if (!resp.ok) continue;
      const data = await resp.json();
      const traits = data.choices?.[0]?.message?.content
        .replace(/\s*\n\s*/g, "")
        .trim();
      return res.status(200).json({ traits });
    } catch {
      // try next OR key
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
          body: JSON.stringify({
            prompt: { text: userInput },
            temperature: 0.2,
          }),
        },
        8_000
      );
      if (!resp.ok) continue;
      const data = await resp.json();
      const traits = data.candidates?.[0]?.content
        .replace(/\s*\n\s*/g, "")
        .trim();
      return res.status(200).json({ traits });
    } catch {
      // try next Gemini key
    }
  }

  // 3) Last-ditch fallback
  console.error("Trait extraction failed on all keys; returning defaults.");
  return res
    .status(200)
    .json({ traits: "curiosity, courage, reflection" });
}
