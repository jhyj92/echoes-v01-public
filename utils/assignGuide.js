// utils/assignGuide.js
/**
 * Picks a guide archetype based on the chosen domain
 */
import { guides } from "@/data/guides";

/**
 * Assign a guide based on the given domain.
 * @param {string} domain - The domain to find a guide for.
 * @returns {object} - The matched guide object.
 */
export default function assignGuide(domain) {
  // Find guide whose domains include the given domain
  const guide = guides.find((g) => g.domains.includes(domain.toLowerCase()));

  // Fallback if no exact match is found
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
