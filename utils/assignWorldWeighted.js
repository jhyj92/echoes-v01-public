// utils/assignWorldWeighted.js
import { WORLDS } from "@/data/worlds";

// Very-light weighting for v0.2
export default function assignWorldWeighted(traitsRaw = []) {
  const traits = traitsRaw.map((t) => t.toLowerCase().trim());

  const scored = WORLDS.map((w) => {
    let score = 0;
    traits.forEach((t) => {
      if (w.keywords.includes(t)) score += 2;          // simple match weight
    });
    return { world: w, score };
  });

  const best = scored.sort((a, b) => b.score - a.score)[0];

  // fallback to Echo Fields if no match
  return best.score === 0
    ? WORLDS.find((w) => w.id === "echoFields")
    : best.world;
}
