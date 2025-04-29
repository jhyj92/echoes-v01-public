// utils/sessionManager.js

/**
 * Save a value under a namespaced key in localStorage
 */
export function saveSession(key, value) {
  try {
    localStorage.setItem(`echoes_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn("Session save failed", key, e);
  }
}

/**
 * Load a value from localStorage, falling back if missing
 */
export function loadSession(key, fallback = null) {
  try {
    const item = localStorage.getItem(`echoes_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Clear all session entries (optional reset)
 */
export function clearSession() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith("echoes_"))
    .forEach((k) => localStorage.removeItem(k));
}
