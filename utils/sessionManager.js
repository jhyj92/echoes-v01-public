// utils/sessionManager.js

/**
 * Save a value under a namespaced key in localStorage
 */
export function saveSession(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`echoes_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn("Session save failed", key, e);
  }
}

/**
 * Load a value from localStorage, falling back if missing
 */
export function loadSession(key, fallback = null) {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(`echoes_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Clear all session entries (optional reset)
 */
export function clearSession() {
  if (typeof window === "undefined") return;
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith("echoes_"))
    .forEach((k) => window.localStorage.removeItem(k));
}
