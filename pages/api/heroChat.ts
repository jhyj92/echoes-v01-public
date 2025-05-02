// pages/api/heroChat.ts

import type { NextApiRequest, NextApiResponse } from "next";
import genai from "google-generativeai";
import dotenv from "dotenv";
dotenv.config();

genai.configure({ api_key: process.env.GOOGLE_API_KEY });

import fetchWithTimeout from "@/utils/fetchWithTimeout";

const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);
let orIndex = 0;
function nextOrKey(): string {
  const key = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return key;
}

type Msg = { role: "user"|"assistant"; content: string; };
type HCResponse = { reply: string; done?: boolean; error?: string; };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HCResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ reply: "", error: "Method Not Allowed" });
  }

  const { superpower, heroName, history } = req.body as {
    superpower?: string;
    heroName?: string;
    history?: Msg[];
  };
  if (typeof superpower!=="string" || typeof heroName!=="string" || !Array.isArray(history)) {
    return res.status(400).json({ reply:"", error:"Invalid body" });
  }

  const turns = history.filter(m=>m.role==="assistant").length;
  if (turns >= 10) return res.status(200).json({ reply:"", done:true });

  const systemPrompt = `
You are ${heroName}, a hero in crisis who knows the user's superpower is "${superpower}". Speak with urgency and hope. Number each reply.
`.trim();

  const messages = [
    { role: "system", content: systemPrompt },
    ...history
  ];

  // Gemini
  try {
    const resp = await genai.generateMessage({
      model: "gemini-2.5-flash-preview-04-17",
      prompt: { messages },
      temperature: 0.75
    });
    return res.status(200).json({ reply: resp.text.trim() });
  } catch {
    // fallback OR
  }

  // OpenRouter fallback
  for (let i=0; i<OR_KEYS.length; i++) {
    try {
      const resp = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method:"POST",
          headers:{
            Authorization:`Bearer ${nextOrKey()}`,
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages,
            temperature: 0.4
          })
        },8000);
      if (!resp.ok) continue;
      const j = await resp.json();
      return res.status(200).json({ reply: j.choices[0].message.content.trim() });
    } catch {
      continue;
    }
  }

  return res.status(200).json({ reply:"..." });
}
