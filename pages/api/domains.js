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

  const { answers } = req.body || {};
  if (!Array.isArray(answers) || answers.length < 1) {
    return res.status(400).json({ error: "Please provide an array of answers" });
  }

  const prompt = `Based on these answers:\n${answers
    .map((a) => `• ${a}`)
    .join("\n")}\nSuggest five poetically phrased super-power domains.`;

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
              { role: "system", content: "You are an insightful domain suggester." },
              { role: "user", content: prompt },
            ],
            temperature: 0.8,
          }),
        },
        12_000
      );
      if (!resp.ok) throw new Error(`OR ${resp.status}`);
      const data = await resp.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const domains = raw
        .split(/[\n,•\-]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5);
      if (domains.length) return res.status(200).json({ domains });
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
          body: JSON.stringify({
            prompt: { text: prompt },
            temperature: 0.8,
          }),
        },
        12_000
      );
      if (!resp.ok) throw new Error(`GM ${resp.status}`);
      const data = await resp.json();
      const raw = data.candidates?.[0]?.content || "";
      const domains = raw
        .split(/[\n,•\-]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5);
      if (domains.length) return res.status(200).json({ domains });
    } catch {
      // next Gemini key
    }
  }

  // 3) Hard-coded fallback
  return res.status(200).json({
    domains: [
      "Curiosity’s Cartography",
      "Quiet Courage Engineering",
      "Reflective Insight Weaving",
      "Wonder-Driven Systems",
      "Adaptive Storycraft",
    ],
  });
}
