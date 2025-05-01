// utils/interviewerManager.js
/* ------------------------------------------------------------------------
   Echoes ▸ InterviewerManager
   ------------------------------------------------------------------------
   – Sends exactly-ten poetic questions, one at a time
   – Primary model  : OpenRouter (DeepSeek V3)      (fast, cheap)
   – Fallback model : Gemini Flash                  (low-latency backup)
   --------------------------------------------------------------------- */

import fetchWithTimeout from "@/utils/fetchWithTimeout";

/* ---------- ENV & CONSTANTS ----------------------------------------- */

const OPENROUTER_API_KEY      = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;   // sk-or-v1-fa76…f31
const GEMINI_API_KEY          = process.env.NEXT_PUBLIC_GEMINI_API_KEY;       // set in Vercel
const OPENROUTER_ENDPOINT     = "https://openrouter.ai/api/v1/chat/completions";
const GEMINI_ENDPOINT         = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const REQUEST_TIMEOUT_MS      = 12_000; // fail fast – UI shows latency overlay after 5s

/* ---------- SYSTEM PROMPT  (tightened version) ---------------------- */

const SYSTEM_PROMPT = `
You are **Echoes**, a poetic interviewer who unveils a visitor’s hidden super-power — the
subtle talent found where their skills, interests, and experiences meet.

• Ask **exactly ten** evocative questions, **one at a time**.
• Focus on what the visitor enjoys, excels at, or finds deeply meaningful.
• Keep language lyrical and gentle; no asterisks, numbering, or meta-explanations.
• After each answer, reply with only the next question text.
• If the visitor responds with profanity or “I don’t know”, calmly rephrase once.

Stop after question ten.
`.trim();

/* ---------- INTERNAL ------------------------------------------------- */

async function callOpenRouter(userHistory) {
  const body = {
    model: "deepseek-chat",                    // DeepSeek-V3 (high quality, poetic)
    messages: [
      { role: "system",   content: SYSTEM_PROMPT },
      ...userHistory
    ],
    temperature: 0.8
  };

  const res = await fetchWithTimeout(
    OPENROUTER_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(body),
    },
    REQUEST_TIMEOUT_MS
  );
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const json = await res.json();
  return json.choices[0].message.content.trim();
}

async function callGemini(userHistory) {
  const contents = [
    { role: "system", content: SYSTEM_PROMPT },
    ...userHistory.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      content: m.content,
    })),
  ];

  const body = { contents, generationConfig: { temperature: 0.8 } };

  const res = await fetchWithTimeout(
    `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    REQUEST_TIMEOUT_MS
  );

  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

/* ---------- PUBLIC  -------------------------------------------------- */

export function startInterview() {
  // history is array of { role:"user"|"assistant", content:string }
  return askNext([]);
}

export async function askNext(history) {
  try {
    return await callOpenRouter(history);
  } catch (err) {
    console.warn("OpenRouter failed, falling back to Gemini >", err.message);
    try {
      return await callGemini(history);
    } catch (gErr) {
      console.error("Both models failed", gErr.message);
      throw new Error("All AI back-ends unreachable");
    }
  }
}
