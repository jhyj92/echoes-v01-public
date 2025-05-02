// pages/api/reflectionLetter.ts

import type { NextApiRequest, NextApiResponse } from "next";
import genai from "google-generativeai";
import dotenv from "dotenv";
dotenv.config();

genai.configure({ api_key: process.env.GOOGLE_API_KEY });

import fetchWithTimeout from "@/utils/fetchWithTimeout";

const OR_KEYS = (process.env.OPENROUTER_KEYS || "")
  .split(",")
  .map((k)=>k.trim())
  .filter(Boolean);
let orIndex = 0;
function nextOrKey():string{
  const k = OR_KEYS[orIndex % OR_KEYS.length];
  orIndex++;
  return k;
}

type LetterResponse = { letter: string; error?: string; };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LetterResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow","POST");
    return res.status(405).json({ letter:"", error:"Method Not Allowed" });
  }

  const { heroName, superpower, history } = req.body as {
    heroName?:string;
    superpower?:string;
    history?:{role:"user"|"assistant";content:string;}[];
  };
  if (typeof heroName!=="string"||typeof superpower!=="string"||!Array.isArray(history) ) {
    return res.status(400).json({ letter:"", error:"Invalid body" });
  }

  const systemPrompt = `
You are ${heroName}, writing a heartfelt letter praising the user's superpower "${superpower}". Use the conversation history as examples.
`.trim();

  const bullets = history.map((m,i)=>
    `• ${i+1}. ${m.role==="assistant"?heroName:"You"}: ${m.content}`
  ).join("\n");

  const userPrompt = `
Conversation:
${bullets}

Write a 2–3 paragraph letter:
- Celebrate "${superpower}"
- Reflect on two moments above
- Offer guidance
- Sign off as ${heroName}
`.trim();

  // Gemini
  try {
    const resp = await genai.generateMessage({
      model:"gemini-2.5-flash-preview-04-17",
      prompt:{messages:[
        {role:"system",content:systemPrompt},
        {role:"user",content:userPrompt}
      ]},
      temperature:0.7
    });
    return res.status(200).json({ letter: resp.text.trim() });
  } catch {
    // fallback OR
  }

  // OpenRouter fallback
  for (let i=0;i<OR_KEYS.length;i++){
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
            model:"deepseek/deepseek-chat-v3-0324:free",
            messages:[
              {role:"system",content:systemPrompt},
              {role:"user",content:userPrompt}
            ],
            temperature:0.35
          })
        },10000
      );
      if(!resp.ok) continue;
      const j = await resp.json();
      return res.status(200).json({ letter: j.choices[0].message.content.trim() });
    }catch{
      continue;
    }
  }

  // Static fallback
  const fallback = `Dear Seeker,

Your gift—${superpower}—shone brightly in our journey. Remember when…
…

Always in echoes,
${heroName}`;
  return res.status(200).json({ letter: fallback });
}
