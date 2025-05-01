// utils/assignWorldWeighted.js

import { WORLDS } from "@/data/worlds";

/**
 * Weighted world assignment:
 * +3 for weightKeywords, +1 for softKeywords.
 * Fallback to the “whispergrove” world if nothing matches.
 */
export default function assignWorldWeighted(traitsRaw = []) {
  const traits = traitsRaw
    .map((t) => t.toLowerCase().trim())
    .slice(0, 4);

  const scored = WORLDS.map((world) => {
    let score = 0;
    for (const t of traits) {
      if (world.weightKeywords.includes(t)) score += 3;
      else if (world.softKeywords.includes(t)) score += 1;
    }
    return { world, score };
  });

  const best = scored.reduce((a, b) => (b.score > a.score ? b : a), scored[0]);
  if (best.score === 0) {
    return WORLDS.find((w) => w.id === "whispergrove") || WORLDS[0];
  }
  return best.world;
}
