/**
 * Simple localStorage wrapper with SSR guard and error handling.
 */

export function getSessionValue<T = any>(key: string, defaultValue: T | null = null): T | null {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (err) {
    console.warn(`getSessionValue: failed to parse key "${key}"`, err);
    return defaultValue;
  }
}

export function setSessionValue(key: string, value: any): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`setSessionValue: failed to serialize key "${key}"`, err);
  }
}

export function clearSessionValue(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`clearSessionValue: failed to remove key "${key}"`, err);
  }
}
