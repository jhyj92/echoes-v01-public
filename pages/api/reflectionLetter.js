// pages/api/reflectionLetter.ts

import type { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";
dotenv.config();

import fetchWithTimeout from "@/utils/fetchWithTimeout";

const GM_KEYS = (process.env.GEMINI_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

let gmIndex = 0;
let orIndex = 0;

function nextGmKey(): string {
  const key = GM_KEYS[gmIndex % GM_KEYS.length];
  gmIndex++;
  return key;
}

function nextOrKey(): string {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return key;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ReflectionLetterResponse {
  letter?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReflectionLetterResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res
      .status(405)
      .json({ error: "Method Not Allowed" });
  }

  const { heroName, superpower, history } = req.body as {
    heroName?: string;
    superpower?: string;
    history?: Message[];
  };

  if (
    typeof heroName !== "string" ||
    typeof superpower !== "string" ||
    !Array.isArray(history) ||
    history.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Invalid request payload." });
  }

  // Build the system prompt: hero writing the letter
  const systemPrompt = `
You are ${heroName}, the heroic figure with whom the user conversed. Now you write a heartfelt reflection letter to the user. You know their superpower is "${superpower}". Refer to the conversation history as evidence of how their power manifested and grew. Write in a poetic, warm tone as a letter.
  `.trim();

  // Flatten the last 10 messages (both roles) into a bullet list
  const historyBullets = history
    .map((m, idx) => {
      const who = m.role === "assistant" ? heroName : "You";
      const num = idx + 1;
      return `• ${num}. ${who}: ${m.content}`;
    })
    .join("\n");

  const userPrompt = `
Conversation Highlights:
${historyBullets}

Based on the above, write a reflective letter of 2–3 paragraphs. In the letter:
- Explicitly name and celebrate their superpower "${superpower}".
- Reflect on at least two moments from the conversation where this power shone.
- Offer gentle guidance on how they might continue to hone it.
- Conclude with a warm, encouraging sign-off as ${heroName}.
  `.trim();

  // Helper to call an LLM with rotation
  async function callGemini(): Promise<string | null> {
    for (let i = 0; i < GM_KEYS.length; i++) {
      try {
        const resp = await fetchWithTimeout(
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-preview-04-17:generateMessage?key=${nextGmKey()}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: {
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userPrompt }
                ]
              },
              temperature: 0.7,
              // Let paragraphs flow naturally
            }),
          },
          10000
        );
        if (!resp.ok) continue;
        const data = await resp.json();
        const letter = data.candidates?.[0]?.content?.trim();
        if (letter) return letter;
      } catch {
        // try next Gemini key
      }
    }
    return null;
  }

  async function callDeepSeek(): Promise<string | null> {
    for (let j = 0; j < OR_KEYS.length; j++) {
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
              model: "deepseek/deepseek-chat-v3-0324:free",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              temperature: 0.35,
            }),
          },
          10000
        );
        if (!resp.ok) continue;
        const json = await resp.json();
        const letter = json.choices?.[0]?.message?.content?.trim();
        if (letter) return letter;
      } catch {
        // try next OR key
      }
    }
    return null;
  }

  // Attempt Gemini → DeepSeek → Static fallback
  let letter = await callGemini();
  if (!letter) letter = await callDeepSeek();
  if (!letter) {
    letter = `Dear Seeker,
  
Though the echoes of our conversation linger like distant stars, your gift—${superpower}—blazes brightly. Remember when you guided me through the storm with calm insight, and when your unique vision reshaped our path? These moments reveal the heart of your power.

Continue to trust this strength. Let it light your way in future trials, and know I stand with you, always.

Yours in echoes,
${heroName}`;
  }

  return res.status(200).json({ letter });
}
