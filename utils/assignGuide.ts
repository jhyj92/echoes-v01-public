/**
 * Picks a guide archetype based on the chosen domain.
 */
import { guides } from "@/data/guides";

/**
 * Assign a guide based on the given domain.
 * @param domain The domain to find a guide for.
 * @returns The matched guide object or a fallback.
 */
export default function assignGuide(domain: string) {
  const guide = guides.find(g => g.domains.includes(domain.toLowerCase()));

  if (!guide) {
    return {
      id: "unknown",
      name: "The Unknown",
      domains: [],
      intro: "A quiet presence watches from beyond, undefined yet ever-present.",
    };
  }

  return guide;
}
