import { useState, useEffect } from "react";

/** 
 * useLocalState (React Hook)
 * Persist state in localStorage (SSR-safe).
 * Warns on read/write errors.
 */
export function useLocalState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      // SSR: return initial on server
      return initialValue;
    }
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch (err) {
      console.warn(`useLocalState: failed to parse "${key}" from localStorage`, err);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`useLocalState: failed to serialize "${key}" to localStorage`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
