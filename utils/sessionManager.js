// utils/sessionManager.js
/**
 * Simple localStorage wrapper with SSR guard
 */
export function getSessionValue(key, defaultValue = null) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setSessionValue(key, value) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export function clearSessionValue(key) {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
}
