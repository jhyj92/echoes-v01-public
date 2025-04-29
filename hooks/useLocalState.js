// hooks/useLocalState.js
import { useState, useEffect } from 'react';

export function useLocalState(key, initial) {
  const [val, setVal] = useState(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      /* ignore */
    }
  }, [key, val]);

  return [val, setVal];
}
