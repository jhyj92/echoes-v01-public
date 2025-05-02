// pages/api/superpower.ts

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

type SuperpowerResponse = {
  superpower: string;
  description: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuperpowerResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ superpower: "", description: "", error: "Method Not Allowed" });
  }

  const { domain, guideAnswers } = req.body as {
    domain?: string;
    guideAnswers?: string[];
  };

  if (
    typeof domain !== "string" ||
    !Array.isArray(guideAnswers) ||
    guideAnswers.length < 10
  ) {
    return res
      .status(400)
      .json({ superpower: "", description: "", error: "Invalid domain or insufficient guide answers." });
  }

  // Build the prompts
  const systemPrompt = `You are Echoes’ insightful narrator.`;

  const bulletList = guideAnswers
    .map((ans, i) => `• Q${i + 1}: ${ans}`)
    .join("\n");

  const userPrompt = `
Domain: "${domain}"

Based on the following ten reflections from the user:
${bulletList}

Task:
Synthesize a single, poetic superpower label that captures this user’s unique strength within the chosen domain. Then provide a brief (1-2 sentence) evocative description of how this superpower manifests in their life.

Output Format:
{
  "superpower": "[Poetic Superpower Label]",
  "description": "[Brief evocative description]"
}
  `.trim();

  // Try Gemini primary
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
            temperature: 0.75,
            stopSequences: ["\n\n"]
          }),
        },
        10000
      );

      if (!resp.ok) continue;
      const data = await resp.json();
      const content = data.candidates?.[0]?.content?.trim();
      if (content) {
        // Try to parse JSON
        try {
          const parsed = JSON.parse(content);
          return res.status(200).json({
            superpower: parsed.superpower,
            description: parsed.description
          });
        } catch {
          // If parsing fails, fall back to regex
          const matchLabel = content.match(/"superpower"\s*:\s*"([^"]+)"/);
          const matchDesc = content.match(/"description"\s*:\s*"([^"]+)"/);
          const label = matchLabel?.[1] || "";
          const desc = matchDesc?.[1] || "";
          return res.status(200).json({
            superpower: label,
            description: desc
          });
        }
      }
    } catch {
      // try next Gemini key
    }
  }

  // Fallback to DeepSeek
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
            temperature: 0.4,
            stop: ["\n\n"]
          }),
        },
        10000
      );

      if (!resp.ok) continue;
      const json = await resp.json();
      const content = json.choices?.[0]?.message?.content?.trim();
      if (content) {
        try {
          const parsed = JSON.parse(content);
          return res.status(200).json({
            superpower: parsed.superpower,
            description: parsed.description
          });
        } catch {
          const matchLabel = content.match(/"superpower"\s*:\s*"([^"]+)"/);
          const matchDesc = content.match(/"description"\s*:\s*"([^"]+)"/);
          const label = matchLabel?.[1] || "";
          const desc = matchDesc?.[1] || "";
          return res.status(200).json({
            superpower: label,
            description: desc
          });
        }
      }
    } catch {
      // try next OR key
    }
  }

  // Static fallback
  return res.status(200).json({
    superpower: "Resonant Seeker",
    description: "You have an uncanny ability to find meaning and harmony where others only see noise."
  });
}
