// utils/assignGuide.js

import { guides } from "@/data/guides";

/**
 * Pick the best guide archetype based on overlapping trait keywords.
 * @param {string[]} traitsRaw
 * @returns {object} guide
 */
export default function assignGuide(traitsRaw = []) {
  const traits = traitsRaw.map((t) => t.toLowerCase().trim());
  const scored = guides.map((g) => {
    const overlap = g.domains.reduce(
      (count, dom) =>
        count + (traits.includes(dom.toLowerCase().trim()) ? 1 : 0),
      0
    );
    return { guide: g, score: overlap };
  });

  // Choose highest‐scoring guide
  const best = scored.reduce((a, b) => (b.score > a.score ? b : a), scored[0]);
  return best.score > 0 ? best.guide : guides[0];
}
