import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map(k => k.trim())
  .filter(Boolean);

let orIndex = 0;
function nextOrKey() {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return key;
}

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY! });

function sanitizeMessage(text: string): string {
  return text.replace(/[\r\n]+/g, " ").trim();
}

function buildHeroPrompt(
  scenario: string,
  hero: string,
  history: { from: "user" | "hero"; text: string }[],
  userMessage: string
): string {
  const safeHistory = history.map((m, idx) => {
    if (m.from === "hero") {
      const heroCount = history.slice(0, idx + 1).filter(x => x.from === "hero").length;
      return `Hero [${heroCount}]: ${sanitizeMessage(m.text)}`;
    }
    return `User: ${sanitizeMessage(m.text)}`;
  });

  return `
You are ${hero}, a real or fictional character in crisis. You are aware of the user's emerging superpower, and are seeking their help. Share openly about your problem and why you think my strengths might help. Let our chat flow naturally — some back and forth, some reflection.

**Rules:**
- Only write your own dialogue as the hero. Never write the user's dialogue.
- Number each of your replies as "Hero [N]: ..." where N is your message count in this conversation.
- Do not send multiple messages at once.
- After you have sent your 10th reply, pause and offer the user the choice to continue or receive a reflection letter.

**Story Context:** ${scenario}

**Previous conversation:**
${safeHistory.join('\n')}
User: ${sanitizeMessage(userMessage)}
  `.trim();
}

async function callGeminiModel(prompt: string): Promise<string | null> {
  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [prompt],
    });
    if (resp?.text?.trim()) return resp.text.trim();
  } catch (e) {
    console.error("Gemini API error:", e);
  }
  return null;
}

async function callOpenRouterModel(
  model: string,
  prompt: string,
  timeout = 2000
): Promise<string | null> {
  for (let i = 0; i < OR_KEYS.length; i++) {
    try {
      const body = {
        model,
        messages: [
          { role: "system", content: `You are ${prompt}` },
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { scenario, hero, history, userMessage } = req.body;

  if (
    typeof scenario !== "string" ||
    typeof hero !== "string" ||
    !Array.isArray(history) ||
    typeof userMessage !== "string"
  ) {
    return res.status(400).json({ error: "Missing or invalid scenario/hero/history/userMessage" });
  }

  const heroMsgCount = history.filter(m => m.from === "hero").length;

  const prompt = buildHeroPrompt(scenario, hero, history, userMessage);

  // Try Gemini first
  let reply = await callGeminiModel(prompt);
  if (reply) {
    return res.status(200).json({
      reply,
      done: heroMsgCount + 1 >= 10,
      modelUsed: "gemini-2.0-flash-lite",
    });
  }

  // Then OpenRouter deepseek
  reply = await callOpenRouterModel("deepseek/deepseek-chat-v3-0324:free", prompt);
  if (reply) {
    return res.status(200).json({
      reply,
      done: heroMsgCount + 1 >= 10,
      modelUsed: "deepseek/deepseek-chat-v3-0324:free",
    });
  }

  // Then OpenRouter meta-llama
  reply = await callOpenRouterModel("meta-llama/llama-4-scout:free", prompt);
  if (reply) {
    return res.status(200).json({
      reply,
      done: heroMsgCount + 1 >= 10,
      modelUsed: "meta-llama/llama-4-scout:free",
    });
  }

  // Fallback
  res.status(200).json({
    reply: "The echoes are silent…",
    done: false,
    modelUsed: "hardcoded-fallback",
  });
}
