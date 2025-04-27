"use client";

import { useEffect, useState } from "react";
import "../style.css";  // make sure this path is correct

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div />; // ← CHANGE: safer fallback for SSR build

  return (
    <div className="container">
      <div className="title">Welcome to Echoes v0.1</div>
      <div className="subtitle">Your self-discovery journey begins here.</div>
    </div>
  );
}
