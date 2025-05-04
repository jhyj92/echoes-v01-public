import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { reflections, domain } = req.body;
  if (!Array.isArray(reflections) || reflections.length < 1) {
    return res.status(400).json({ error: "Missing reflections" });
  }

  const prompt = `
Given these 10 reflections: ${reflections.join(" | ")}
Suggest five pairs of (hero or anti-hero) and a poetic scenario, drawn from movies, stories, or history, where the user's emerging superpower could help. Each pair should include:
- The hero/anti-hero's name and brief identity (e.g., "Astra, the Last Dreamkeeper", "Ada Lovelace, pioneer of computation", "Luke Skywalker, Jedi in exile", "The Minotaur, lost in the labyrinth")
- A 1-2 sentence scenario describing their crisis and why they might reach out to the user.
Return only a list of these pairs, no meta commentary.
`;

  try {
    const resp = await gemini.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [prompt],
    });
    if (resp?.text?.trim()) {
      // Fixed regex: put dash at end of character class
      const options = resp.text.split(/\n+/).map(line => {
        const match = line.match(/^(.*?)[–:\-]+(.*)$/);
        if (match) {
          return {
            hero: match[1].trim(),
            scenario: match[2].trim(),
          };
        }
        return null;
      }).filter(Boolean);
      if (options.length > 0) {
        return res.status(200).json({ options });
      }
    }
  } catch (error) {
    console.error("suggestHeroScenario error:", error);
  }
  // Hardcoded fallback
  res.status(200).json({
    options: [
      {
        hero: "Astra, the Last Dreamkeeper",
        scenario: "Astra faces the fading of dreams in her world, and senses your power could rekindle hope."
      },
      {
        hero: "Ada Lovelace, pioneer of computation",
        scenario: "Ada is stuck on an impossible equation and believes your insight may reveal a new path."
      }
    ]
  });
}
