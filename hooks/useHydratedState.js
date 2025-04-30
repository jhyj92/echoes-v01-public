// hooks/useHydratedState.js

import { useState, useEffect } from "react";

/**
 * SSR‐safe state hook that waits for client hydration
 * before reading localStorage to avoid React mismatch.
 *
 * @param {string} key localStorage key
 * @param {any} fallback value to use before hydration or if missing
 * @returns the stored value or fallback
 */
export default function useHydratedState(key, fallback) {
  const [hydrated, setHydrated] = useState(false);
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "null");
      setValue(stored ?? fallback);
    } catch (e) {
      setValue(fallback);
    }
    setHydrated(true);
  }, [key, fallback]);

  // Until hydration, render nothing to avoid mismatch
  if (!hydrated) return fallback;
  return value;
}
