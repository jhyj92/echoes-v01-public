export function assignWorld(traits) {
  const t = traits.toLowerCase();
  if (t.includes("creativity")   || t.includes("imagination")) return "Dream-Sea Realm";
  if (t.includes("strategy")     || t.includes("logic"))       return "Crystalline Labyrinth";
  if (t.includes("empathy")      || t.includes("healing"))     return "Verdant Veil";
  if (t.includes("resilience")   || t.includes("strength"))    return "Emberwake Highlands";
  return "Shifting Echo Fields";
}
