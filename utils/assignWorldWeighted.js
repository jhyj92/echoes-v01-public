// utils/assignWorldWeighted.js

import { WORLDS } from "@/data/worlds";

/**
 * assignWorldWeighted
 * - Takes an array of user traits (strings).
 * - Scores each world by:
 *     + +3 points per matched weightKeyword
 *     + +1 point per matched softKeyword
 * - Returns the world object with the highest total score.
 * - Ties broken by first appearance in WORLDS.
 */
export default function assignWorldWeighted(traitsRaw = []) {
  const traits = traitsRaw
    .map((t) => t.toLowerCase().trim())
    .slice(0, 4); // consider only top 4 traits

  // Compute scores
  const scored = WORLDS.map((world) => {
    let score = 0;
    for (const t of traits) {
      if (world.weightKeywords.includes(t)) score += 3;
      else if (world.softKeywords.includes(t)) score += 1;
    }
    return { world, score };
  });

  // Find best
  const best = scored.reduce((prev, cur) => {
    if (cur.score > prev.score) return cur;
    return prev;
  }, scored[0]);

  // If everyone scores zero, default to Echo Fields
  if (best.score === 0) {
    return WORLDS.find((w) => w.id === "echoFields");
  }

  return best.world;
}
