// pages/api/heroChat.ts

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

type Message = {
  role: "user" | "assistant";
  content: string;
};

type HeroChatResponse = {
  reply: string;
  done?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HeroChatResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res
      .status(405)
      .json({ reply: "", error: "Method Not Allowed" });
  }

  const { superpower, heroName, history } = req.body as {
    superpower?: string;
    heroName?: string;
    history?: Message[];
  };

  if (
    typeof superpower !== "string" ||
    typeof heroName !== "string" ||
    !Array.isArray(history)
  ) {
    return res
      .status(400)
      .json({ reply: "", error: "Invalid request body." });
  }

  // If we've already generated 10 assistant turns, signal done
  const assistantTurns = history.filter((m) => m.role === "assistant").length;
  if (assistantTurns >= 10) {
    return res.status(200).json({ reply: "", done: true });
  }

  const systemPrompt = `
You are ${heroName}, a legendary hero in crisis. You have heard that the user's superpower is "${superpower}", and you believe it can save your world. Speak with urgency, empathy, and hope. Number each message you send.
  `.trim();

  // Build the messages array for the API call
  const messagesPayload = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  // Primary: Google Gemini
  for (let i = 0; i < GM_KEYS.length; i++) {
    try {
      const resp = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-preview-04-17:generateMessage?key=${nextGmKey()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: { messages: messagesPayload },
            temperature: 0.75,
            stopSequences: ["\n"],
          }),
        },
        8000
      );
      if (!resp.ok) continue;
      const data = await resp.json();
      const reply = data.candidates?.[0]?.content?.trim();
      if (reply) {
        return res.status(200).json({ reply });
      }
    } catch {
      // try next Gemini key
    }
  }

  // Fallback: DeepSeek
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
            messages: messagesPayload,
            temperature: 0.4,
            stop: ["\n"],
          }),
        },
        8000
      );
      if (!resp.ok) continue;
      const data = await resp.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
      if (reply) {
        return res.status(200).json({ reply });
      }
    } catch {
      // try next DeepSeek key
    }
  }

  // Ultimate fallback
  return res
    .status(200)
    .json({ reply: "..." });
}
