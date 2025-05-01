// pages/api/domains.js
import dotenv from "dotenv";
dotenv.config();

/* ────────────────────────────────────────────────────────────── */
/*  ENV: comma-separated key pools for rotation                  */
/* ────────────────────────────────────────────────────────────── */
const OR_KEYS = (process.env.OPENROUTER_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
const GM_KEYS = (process.env.GEMINI_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);

let orIndex = 0, gmIndex = 0;
const nextOrKey = () => OR_KEYS[orIndex++ % OR_KEYS.length];
const nextGmKey = () => GM_KEYS[gmIndex++ % GM_KEYS.length];

/* ────────────────────────────────────────────────────────────── */
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const GEMINI_URL     = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const TIMEOUT_MS     = 12_000;

/* util: race fetch vs timeout */
function fetchWithTimeout(url, options = {}, ms = TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

/* ────────────────────────────────────────────────────────────── */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { answers } = req.body || {};
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "answers array required" });
  }

  /* ---- prompt ------------------------------------------------ */
  const prompt =
    `Based on these answers:\n${answers.map(a => `• ${a}`).join("\n")}\n` +
    `Suggest five nuanced “super-power domains” (short poetic labels).`;

  /* ---- attempt OpenRouter first ------------------------------ */
  if (OR_KEYS.length) {
    for (let i = 0; i < OR_KEYS.length; i++) {
      try {
        const body = {
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are an insightful domain suggester." },
            { role: "user",   content: prompt }
          ],
          temperature: 0.8,
        };

        const resp = await fetchWithTimeout(
          OPENROUTER_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${nextOrKey()}`,
            },
            body: JSON.stringify(body),
          }
        );

        if (!resp.ok) throw new Error(`OpenRouter ${resp.status}`);

        const { choices } = await resp.json();
        const raw = choices[0]?.message?.content ?? "";
        const domains = raw.split(/[\n,•\-]+/)
          .map(s => s.trim()).filter(Boolean).slice(0, 5);

        if (domains.length) {
          return res.status(200).json({ domains });
        }
      } catch (err) {
        console.warn("OpenRouter attempt failed:", err.message);
      }
    }
  }

  /* ---- fallback to Gemini Flash ------------------------------ */
  if (GM_KEYS.length) {
    for (let i = 0; i < GM_KEYS.length; i++) {
      try {
        const body = {
          contents: [{ role: "user", content: prompt }],
          generationConfig: { temperature: 0.8 }
        };

        const resp = await fetchWithTimeout(
          `${GEMINI_URL}?key=${nextGmKey()}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        if (!resp.ok) throw new Error(`Gemini ${resp.status}`);

        const data   = await resp.json();
        const raw    = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const domains = raw.split(/[\n,•\-]+/)
          .map(s => s.trim()).filter(Boolean).slice(0, 5);

        if (domains.length) {
          return res.status(200).json({ domains });
        }
      } catch (err) {
        console.warn("Gemini fallback failed:", err.message);
      }
    }
  }

  /* ---- final hard-coded fallback ----------------------------- */
  return res.status(200).json({
    domains: [
      "Curiosity’s Cartography",
      "Quiet Courage Engineering",
      "Reflective Insight Weaving",
      "Wonder-Driven Systems",
      "Adaptive Storycraft"
    ]
  });
}
