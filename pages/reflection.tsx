// pages/reflection.tsx
"use client";

import { useState, useEffect } from "react";
import LatencyOverlay from "@/components/LatencyOverlay";
import ReflectionLetter from "@/components/ReflectionLetter";
import { useRouter } from "next/router";

export default function ReflectionPage() {
  const router = useRouter();
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [letter, setLetter] = useState<string>("");

  useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem("echoes_history") || "[]"));
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/reflectionLetter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroName: "Your Guide",
          superpower: localStorage.getItem("echoes_superpower"),
          history,
        }),
      });
      const { letter: l } = await res.json();
      setLetter(l);
    })();
  }, [history]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-black text-gold">
      <LatencyOverlay />
      {letter ? (
        <ReflectionLetter letter={letter} onContinue={() => router.replace("/hero")} />
      ) : (
        <p>Gathering reflections...</p>
      )}
    </main>
  );
}
