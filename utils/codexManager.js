// utils/codexManager.js

/**
 * Append a new entry to the user’s local Codex.
 * @param {{ content: string }} entry
 */
export function addCodex(entry) {
  const key = "echoes_codex";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push({ 
    content: entry.content, 
    timestamp: Date.now() 
  });
  localStorage.setItem(key, JSON.stringify(existing));
}

/**
 * Load all Codex entries.
 * @returns {Array<{content: string, timestamp: number}>}
 */
export function loadCodex() {
  return JSON.parse(localStorage.getItem("echoes_codex") || "[]");
}
