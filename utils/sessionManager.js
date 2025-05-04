/**
 * Simple localStorage wrapper with SSR guard and error handling
 */

export function getSessionValue(key, defaultValue = null) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (err) {
    console.warn(`getSessionValue: failed to parse key "${key}"`, err);
    return defaultValue;
  }
}

export function setSessionValue(key, value) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`setSessionValue: failed to serialize key "${key}"`, err);
    }
  }
}

export function clearSessionValue(key) {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`clearSessionValue: failed to remove key "${key}"`, err);
    }
  }
}
