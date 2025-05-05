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

async function callOpenRouterModel(prompt: string, timeout = 5000): Promise<string | null> {
  if (OR_KEYS.length === 0) {
    console.error("No OpenRouter API keys provided!");
    return null;
  }

  for (let i = 0; i < OR_KEYS.length; i++) {
    const key = nextOrKey();
    try {
      const body = {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          { role: "system", content: "You are a creative storyteller." },
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

      if (!res.ok) {
        const errText = await res.text();
        console.error(`OpenRouter error response: ${errText}`);
        continue;
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    } catch (e) {
      console.error(`OpenRouter model error:`, e);
    }
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { reflections, domain, superpower } = req.body;
  if (!Array.isArray(reflections) || reflections.length < 1 || typeof superpower !== "string" || typeof domain !== "string") {
    return res.status(400).json({ error: "Missing or invalid reflections, domain, or superpower" });
  }

  const prompt = `
Based on my reflections, domain, and superpower, imagine five characters-real or fictional-who might seek my help at a turning point in their epic story. For each, share their name and an opening scene where my gift could make a difference. Each should feel like an open door to a meaningful encounter, not a dramatic rescue.

Domain: ${domain}
Superpower: ${superpower}
Reflections: ${reflections.join(" | ")}
  `.trim();

  try {
    const text = await callOpenRouterModel(prompt, 7000);

    if (text) {
      const options = text
        .split(/\n+/)
        .map((line) => {
          const match = line.match(/^(.*?)[–:\-]+(.*)$/);
          if (match) {
            return {
              hero: match[1].trim(),
              scenario: match[2].trim(),
            };
          }
          return null;
        })
        .filter(Boolean);

      if (options.length > 0) {
        return res.status(200).json({ options });
      }
    }
  } catch (error) {
    console.error("Error generating hero scenarios:", error);
    return res.status(500).json({ error: "Internal server error" });
  }

  // Hardcoded fallback
  res.status(200).json({
    options: [
      {
        hero: "Astra, the Last Dreamkeeper",
        scenario: "Astra faces the fading of dreams in her world, and senses your power could rekindle hope.",
      },
      {
        hero: "Ada Lovelace, pioneer of computation",
        scenario: "Ada is stuck on an impossible equation and believes your insight may reveal a new path.",
      },
    ],
  });
}
