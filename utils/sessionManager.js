// utils/sessionManager.js

/**
 * Save a JSON-serializable value under `echoes_<key>`.
 */
export function saveSession(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`echoes_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn("Session save failed:", key, e);
  }
}

/**
 * Load a value or return `fallback` if none found / parse error.
 */
export function loadSession(key, fallback = null) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`echoes_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Clear all Echoes-prefixed entries (for a soft reset).
 */
export function clearSession() {
  if (typeof window === "undefined") return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith("echoes_"))
    .forEach((k) => localStorage.removeItem(k));
}
