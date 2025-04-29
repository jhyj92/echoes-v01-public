// utils/assignWorldWeighted.js
import { WORLDS } from '@/data/worlds';

export default function assignWorldWeighted(traitsRaw = []) {
  const traits = traitsRaw.map(t => t.toLowerCase().trim());

  const scored = WORLDS.map(w => {
    let score = 0;
    traits.forEach(t => {
      if (w.weightKeywords.includes(t)) score += 3;
      else if (w.softKeywords.includes(t)) score += 1;
    });
    return { world: w, score };
  });

  // fallback to first (Echo Fields) if all zero
  const best = scored.sort((a, b) => b.score - a.score)[0];
  return best.score === 0 ? WORLDS.find(w => w.id === 'echoField') : best.world;
}
