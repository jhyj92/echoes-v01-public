// utils/assignGuide.js
import { guides } from "@/data/guides";

// Choose guide with most domain overlap (v0.2 simple)
export default function assignGuide(traits = []) {
  const lower = traits.map((t) => t.toLowerCase());

  const scored = guides.map((g) => {
    const overlap = g.domains.filter((d) => lower.includes(d)).length;
    return { guide: g, score: overlap };
  });

  const best = scored.sort((a, b) => b.score - a.score)[0];
  return best.score === 0 ? guides[0] : best.guide;
}
