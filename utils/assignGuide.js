// utils/assignGuide.js
/**
 * Picks a guide archetype based on the chosen domain
 */
import guides from "@/data/guides";

export function assignGuide(domain) {
  // guides.js exports [{ domain: string, name: string, image: string, vibe: string }, …]
  return (
    guides.find((g) => g.domain === domain) ||
    { domain, name: "Echo Guide", image: "/placeholder.png", vibe: "patient" }
  );
}
