// Simple trait→domain mapping for v0.2
const MAP = {
  creativity: "Mind",
  imagination: "Mind",
  analysis: "Mind",
  logic: "Mind",
  empathy: "Heart",
  curiosity: "Heart",
  resilience: "Heart",
  courage: "Spirit",
  leadership: "Spirit",
  passion: "Spirit"
};

export default function categoriseDomains(traits = []) {
  const counts = { Mind: 0, Heart: 0, Spirit: 0 };

  traits.forEach((raw) => {
    const dom = MAP[raw.toLowerCase()] || "Mind";
    counts[dom] += 1;
  });

  // pick highest count; default Mind
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}
