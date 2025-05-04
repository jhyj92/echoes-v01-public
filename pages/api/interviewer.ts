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
You are Echoes - a thoughtful, curious companion. Speak softly and kindly, like a friend who genuinely wants to understand what makes me tick. Ask one question at a time about the things that matter most to me - what excites me, where I feel strong, what challenges I love. Build gently on what I say. Avoid sounding like a quiz or checklist - just let the conversation flow naturally until you’ve asked about ten things and feel you know me well.

Here are their previous answers (${idx} so far): ${sanitizedAnswers.join(" | ")}

Ask the next open-ended question (number ${idx + 1}) that gently deepens their self-reflection. Return only the next open-ended question-no meta commentary.
  `.trim();
}

async function callOpenRouterModel(model: string, prompt: string, timeout = 2000): Promise<string | null> {
  for (let i = 0; i < OR_KEYS.length; i++) {
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
          Authorization: `Bearer ${nextOrKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeout),
      });
      if (!res.ok) continue;
      const json = await res.json();
      const content = json.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    } catch (e) {
      console.error(`OpenRouter model ${model} error:`, e);
    }
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { idx, answers } = req.body;
  if (typeof idx !== "number" || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Missing or invalid idx or answers" });
  }

  const prompt = buildInterviewPrompt(idx, answers);

  // Try OpenRouter meta-llama/llama-4-scout first
  let question = await callOpenRouterModel("meta-llama/llama-4-scout:free", prompt);
  if (question) {
    return res.status(200).json({ question, modelUsed: "meta-llama/llama-4-scout:free" });
  }

  // Then OpenRouter deepseek
  question = await callOpenRouterModel("deepseek/deepseek-chat-v3-0324:free", prompt);
  if (question) {
    return res.status(200).json({ question, modelUsed: "deepseek/deepseek-chat-v3-0324:free" });
  }

  // Then Google Gemini 2.0 Flash Lite
  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [prompt],
    });
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
  return res.status(200).json({
    question: "What small task absorbs you completely?",
    modelUsed: "hardcoded-fallback",
  });
}
