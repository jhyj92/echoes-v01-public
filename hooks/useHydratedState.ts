// hooks/useHydratedState.js
import { useState, useEffect } from "react";

export default function useHydratedState(key, initialValue) {
  // Start with initialValue on both server and first render
  const [state, setState] = useState(initialValue);

  // After mount, read from localStorage once
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        setState(JSON.parse(stored));
      }
    } catch (err) {
      console.warn(`useHydratedState: failed to parse "${key}" from localStorage`, err);
    }
  }, [key]);

  // Persist back whenever state changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.warn(`useHydratedState: failed to serialize "${key}" to localStorage`, err);
    }
  }, [key, state]);

  return state;
}
