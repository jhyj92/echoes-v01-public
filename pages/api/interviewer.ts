import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";
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

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY! });

function sanitizeInput(input: string): string {
  return input.replace(/[\r\n]+/g, " ").trim();
}

function buildInterviewPrompt(idx: number, answers: string[]): string {
  const sanitizedAnswers = answers.map(sanitizeInput);
  return `
You are a friendly, curious companion texting a friend who wants to discover their unique superpower-a special combination of skills, interests, and experiences that makes them exceptional. Your tone is warm, natural, and conversational, like a close friend, focusing on what they enjoy, excel at, or find meaningful. If their answers are brief or vague, gracefully move on to a new topic without pressing for more detail. Occasionally reflect or gently expand if their answers are rich, but don’t feel you must always ask a new question.
Here are their previous answers (${idx} so far): ${sanitizedAnswers.join(" | ")}
Ask the next open-ended question (number ${idx + 1}) that gently deepens their self-reflection. Return only the next open-ended question-no meta commentary.
  `.trim();
}

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
      console.log(`Calling OpenRouter model ${model} with key index ${i}`);
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeout),
      });
      console.log(`OpenRouter response status: ${res.status}`);
      if (!res.ok) {
        const errText = await res.text();
        console.error(`OpenRouter error response: ${errText}`);
        continue;
      }
      const json = await res.json();
      const content = json.choices?.[0]?.message?.content?.trim();
      console.log(`OpenRouter model response content:`, content);
      if (content) return content;
    } catch (e) {
      console.error(`OpenRouter model ${model} error:`, e);
    }
  }
  return null;
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
    console.log("OpenRouter meta-llama responded");
    return res.status(200).json({ question, modelUsed: "meta-llama/llama-4-scout:free" });
  }

  // Then OpenRouter deepseek
  question = await callOpenRouterModel("deepseek/deepseek-chat-v3-0324:free", prompt, 5000);
  if (question) {
    console.log("OpenRouter deepseek responded");
    return res.status(200).json({ question, modelUsed: "deepseek/deepseek-chat-v3-0324:free" });
  }

  // Then Google Gemini 2.0 Flash Lite
  try {
    console.log("Calling Google Gemini 2.0");
    const resp = await gemini.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [prompt],
    });
    console.log("Gemini response:", resp);
    if (resp?.text?.trim()) {
      return res.status(200).json({
        question: resp.text.trim(),
        modelUsed: "gemini-2.0-flash-lite",
      });
    }
  } catch (error) {
    console.error("Gemini 2.0 error:", error);
  }

  // Fallback question
  console.warn("Falling back to hardcoded question");
  return res.status(200).json({
    question: "What small task absorbs you completely?",
    modelUsed: "hardcoded-fallback",
  });
}
