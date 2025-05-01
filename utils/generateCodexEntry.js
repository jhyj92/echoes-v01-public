// utils/generateCodexEntry.js

/**
 * Build the first Codex entry after world/trait discovery.
 * @param {string} world    – e.g. "Dream-Sea Realm"
 * @param {string[]} traits – array of extracted traits
 * @returns {string}
 */
export default function generateCodexEntry(world, traits) {
  const realm = world || "Echoes";
  const slice = Array.isArray(traits) ? traits.slice(0, 3) : [];
  const core = slice.length ? slice.join(", ") : "echoes of self-discovery";
  return `In the ${realm}, the echoes recognise your ${core}.`;
}
