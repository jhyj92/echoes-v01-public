// hooks/useHydratedState.ts
import { useEffect, useState } from "react";

/**
 * Persisted state that is safely hydrated on the client.
 * Generic <T> lets callers specify the shape they expect back.
 */
export default function useHydratedState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(fallback);

  // First paint on the client: pull from localStorage (if it exists)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) setState(JSON.parse(stored));
    } catch {
      /* no-op – corrupted JSON, just keep fallback */
    }
  }, [key]);

  return state;
}
