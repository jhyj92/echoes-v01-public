// pages/api/interviewer.js
import dotenv from "dotenv";
dotenv.config();

const OR_KEYS = (process.env.OPENROUTER_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
const GM_KEYS = (process.env.GEMINI_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);

let orIndex = 0, gmIndex = 0;
const nextOrKey = () => OR_KEYS[orIndex++ % OR_KEYS.length];
const nextGmKey = () => GM_KEYS[gmIndex++ % GM_KEYS.length];

async function fetchWithTimeout(url, opts = {}, ms = 10_000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
  finally { clearTimeout(id); }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { lastAnswer, questionNumber } = req.body || {};
  const sysPrompt = `
You are Echoes, a poetic interviewer designed to gently unveil a visitor's subtle, unique “superpower”—that singular thing they do better than anyone else in the world, often found at the intersection of their skills, interests, and experiences.

Your task is to ask exactly ten evocative, open-ended questions—one at a time—probing what they enjoy, excel at, and find meaningful. Do NOT include any meta-commentary or explanations. After each user reply, pose the next question. Return only the question text in your response.
`.trim();

  // Build the user prompt
  let userPrompt;
  if (!lastAnswer) {
    userPrompt = "BEGIN INTERVIEW: Ask the very first question in a poetic, inviting tone.";
  } else {
    const nextNum = Math.min(questionNumber + 1, 10);
    userPrompt = `User answered: "${lastAnswer}"
Ask question ${nextNum} of 10 in a poetic, introspective way—no numbering, no extra commentary.`;
  }

  const body = {
    model: "deepseek-chat-v3-0324:free",
    messages: [
      { role: "system", content: sysPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7
  };

  // 1) Try OpenRouter
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const resp = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${nextOrKey()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        },
        10_000
      );
      if (!resp.ok) continue;
      const { choices } = await resp.json();
      const question = choices[0]?.message?.content?.trim();
      if (question) return res.status(200).json({ question });
    } catch { /* try next key */ }
  }

  // 2) Fallback: Gemini 2.5 Flash Preview
  for (let j = 0; j < GM_KEYS.length; j++) {
    try {
      const resp = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-preview-04-17:generateMessage?key=${nextGmKey()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: { text: `${sysPrompt}\n\n${userPrompt}` }, temperature: 0.7 })
        },
        10_000
      );
      if (!resp.ok) continue;
      const data = await resp.json();
      const question = data.candidates?.[0]?.content?.trim();
      if (question) return res.status(200).json({ question });
    } catch { /* next Gemini key */ }
  }

  // 3) Hard fallback
  return res.status(200).json({ question: "The echoes are silent for now…" });
}
