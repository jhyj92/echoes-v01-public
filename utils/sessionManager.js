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
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write errors
    }
  }
}

export function clearSessionValue(key) {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore remove errors
    }
  }
}
