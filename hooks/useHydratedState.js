// hooks/useHydratedState.js

import { useState, useEffect } from "react";

export default function useHydratedState(key, fallback) {
  const [val, setVal] = useState(null);
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(key) || "null");
    setVal(stored ?? fallback);
  }, [key]);
  return val;
}
