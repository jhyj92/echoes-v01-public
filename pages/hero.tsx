// pages/hero.tsx
"use client";

import { useState, useEffect } from "react";
import LatencyOverlay from "@/components/LatencyOverlay";
import HeroChat from "@/components/HeroChat";
import { useRouter } from "next/router";

export default function HeroPage() {
  const router = useRouter();
  const [superpower, setSuperpower] = useState<string>("");
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);

  useEffect(() => {
    setSuperpower(localStorage.getItem("echoes_superpower") || "");
  }, []);

  const handleSend = async (message: string) => {
    const newHist = [...history, { role: "user", content: message }];
    setHistory(newHist);
    const res = await fetch("/api/heroChat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        superpower,
        heroName: "Your Guide",
        history: newHist,
      }),
    });
    const { reply, done } = await res.json();
    setHistory([...newHist, { role: "assistant", content: reply }]);
    if (done) {
      router.push("/reflection");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-black text-gold">
      <LatencyOverlay />
      <HeroChat history={history} onSend={handleSend} />
    </main>
  );
}
