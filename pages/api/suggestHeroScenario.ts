import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY! });

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
`;

  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [prompt],
    });

    if (resp?.text?.trim()) {
      const options = resp.text
        .split(/\n+/)
        .map(line => {
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
    // If no valid options parsed, fallback below
  } catch (error) {
    console.error("suggestHeroScenario error:", error);
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
