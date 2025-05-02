// hooks/useHydratedState.ts
import { useState, useEffect, Dispatch, SetStateAction } from "react";

export default function useHydratedState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);

  // On mount, load from localStorage if available
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        setState(JSON.parse(stored) as T);
      } catch {
        // ignore parse errors
      }
    }
  }, [key]);

  // Whenever state changes, persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore write errors
    }
  }, [key, state]);

  return [state, setState];
}
