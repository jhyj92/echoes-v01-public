// utils/assignGuide.js

import { guides } from "@/data/guides";

/**
 * assignGuide
 * - Accepts an array of traits (strings).
 * - Scores each guide by the count of matching domains.
 * - Returns the guide object with the highest overlap.
 * - Ties broken by first appearance.
 */
export default function assignGuide(traitsRaw = []) {
  const traits = traitsRaw.map((t) => t.toLowerCase().trim());
  // Score guides
  const scored = guides.map((g) => {
    const overlap = g.domains.reduce(
      (count, dom) => count + (traits.includes(dom) ? 1 : 0),
      0
    );
    return { guide: g, score: overlap };
  });

  // Pick best
  const best = scored.reduce((prev, cur) =>
    cur.score > prev.score ? cur : prev
  , scored[0]);

  // Default to first if none match
  return best.score > 0 ? best.guide : guides[0];
}
