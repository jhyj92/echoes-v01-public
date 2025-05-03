"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Starfield from "@/components/Starfield";
import LatencyOverlay from "@/components/LatencyOverlay";
import HeroChat from "@/components/HeroChat";

export default function HeroPage() {
  const router = useRouter();
  const [scenario, setScenario] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("echoes_scenario");
    if (!stored) {
      router.replace("/guide");
    } else {
      setScenario(stored);
    }
  }, [router]);

  if (!scenario) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-black text-gold">
        <LatencyOverlay />
        <p className="italic mt-4">The echoes are aligning your path…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-black text-gold">
      <LatencyOverlay />
      <Starfield />
      <HeroChat scenario={scenario} />
    </main>
  );
}
