// utils/assignGuide.js
import { guides } from "@/data/guides";

/**
 * Pick the guide whose domain list overlaps most with userTraits.
 * Break ties by first declared in array.
 */
export function assignGuide(userTraits = []) {
  if (!Array.isArray(userTraits) || !userTraits.length) return guides[0];

  // very simple similarity: count shared keywords
  let best = guides[0];
  let bestScore = 0;

  guides.forEach(g => {
    const score = g.domains.filter(d => userTraits.includes(d)).length;
    if (score > bestScore) {
      best = g;
      bestScore = score;
    }
  });

  return best;
}
