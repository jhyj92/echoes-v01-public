// pages/hero.tsx
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
    const s = localStorage.getItem("echoes_scenario");
    if (!s) {
      router.replace("/guide");
    } else {
      setScenario(s);
    }
  }, [router]);

  if (!scenario) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-black text-gold">
      <LatencyOverlay />
      <Starfield />
      <HeroChat scenario={scenario} />
    </main>
  );
}
