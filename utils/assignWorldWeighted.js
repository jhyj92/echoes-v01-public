// utils/assignWorldWeighted.js

import { WORLDS } from "@/data/worlds";

/**
 * assignWorldWeighted
 * - Scores each world by weightKeywords (+3) and softKeywords (+1)
 * - Returns the highest-scoring world object
 * - On a 0-score tie, defaults to "whispergrove"
 */
export default function assignWorldWeighted(traitsRaw = []) {
  const traits = traitsRaw
    .map((t) => t.toLowerCase().trim())
    .slice(0, 4);

  const scored = WORLDS.map((world) => {
    let score = 0;
    for (const t of traits) {
      if (world.weightKeywords.includes(t)) score += 3;
      else if (world.softKeywords.includes(t))  score += 1;
    }
    return { world, score };
  });

  const best = scored.reduce((prev, cur) => (cur.score > prev.score ? cur : prev), scored[0]);

  if (best.score === 0) {
    // fallback to the spec’s Whispergrove Hollow
    return WORLDS.find((w) => w.id === "whispergrove");
  }
  return best.world;
}
