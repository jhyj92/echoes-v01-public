import type { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";

dotenv.config();

const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

let orIndex = 0;
function nextOrKey() {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return key;
}

function sanitizeInput(input: string): string {
  return input.replace(/[\r\n]+/g, " ").trim();
}

function buildInterviewPrompt(idx: number, answers: string[]): string {
  const sanitizedAnswers = answers.map(sanitizeInput);
  return `
You are a friendly, curious companion. Start simple - ask about what excites me, where I lose track of time, what I enjoy most. As we talk, follow my answers naturally. If I give rich answers, feel free to reflect or expand gently - don’t feel you must always ask a new question. After about 8–10 exchanges, begin summarising softly what seems to stand out about me. End naturally, not abruptly - something like "I feel I understand you much better now."
Here are their previous answers (${idx} so far): ${sanitizedAnswers.join(" | ")}
Ask the next open-ended question (number ${idx + 1}) that gently deepens their self-reflection. Return only the next open-ended question-no meta commentary.
  `.trim();
}

// --- OpenRouter API Call ---
async function callOpenRouterModel(model: string, prompt: string, timeout = 5000): Promise<string | null> {
  if (OR_KEYS.length === 0) {
    console.error("No OpenRouter API keys provided!");
    return null;
  }

  for (let i = 0; i < OR_KEYS.length; i++) {
    const key = nextOrKey();
    try {
      const body = {
        model,
        messages: [
          { role: "system", content: "You are the quiet voice of Echoes." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      };
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeout),
      });
      const json = await res.json();
      // Log full response for debugging
      console.log("Full OpenRouter response:", JSON.stringify(json, null, 2));
      const content = json.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    } catch (e) {
      console.error(`OpenRouter model ${model} error:`, e);
    }
  }
  return null;
}

// --- Gemini REST API Call ---
async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) {
    console.error("GEMINI_KEY is not set.");
    return null;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      { parts: [{ text: prompt }] }
    ]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    // Log full response for debugging
    console.log("Full Gemini REST API response:", JSON.stringify(json, null, 2));
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() || null;
  } catch (error) {
    console.error("Gemini REST API error:", error);
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("OPENROUTER_KEYS:", OR_KEYS);
  console.log("GEMINI_KEY:", Boolean(process.env.GEMINI_KEY));

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  console.log("Received request body:", req.body);

  const { idx, answers } = req.body;
  if (typeof idx !== "number" || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Missing or invalid idx or answers" });
  }

  const prompt = buildInterviewPrompt(idx, answers);
  console.log("Built prompt:", prompt);

  // Try OpenRouter meta-llama/llama-4-scout first
  let question = await callOpenRouterModel("meta-llama/llama-4-scout:free", prompt, 5000);
  if (question) {
    return res.status(200).json({ question, modelUsed: "meta-llama/llama-4-scout:free" });
  }

  // Then OpenRouter deepseek
  question = await callOpenRouterModel("deepseek/deepseek-chat-v3-0324:free", prompt, 5000);
  if (question) {
    return res.status(200).json({ question, modelUsed: "deepseek/deepseek-chat-v3-0324:free" });
  }

  // Then Google Gemini via REST API
  question = await callGemini(prompt);
  if (question) {
    return res.status(200).json({
      question,
      modelUsed: "gemini-pro-rest",
    });
  }

  // Fallback question
  return res.status(200).json({
    question: "What small task absorbs you completely?",
    modelUsed: "hardcoded-fallback",
  });
}
