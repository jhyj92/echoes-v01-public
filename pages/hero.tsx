"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Starfield from "@/components/Starfield";
import LatencyOverlay from "@/components/LatencyOverlay";
import HeroChat from "@/components/HeroChat";

export default function HeroPage() {
  const router = useRouter();
  const [scenario, setScenario] = useState<string | null>(null);
  const [hero, setHero] = useState<string | null>(null);
  const [superpower, setSuperpower] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const storedScenario = localStorage.getItem("echoes_scenario");
    const storedHero = localStorage.getItem("echoes_hero");
    const storedSuperpower = localStorage.getItem("echoes_superpower");

    if (!storedScenario || !storedHero || !storedSuperpower) {
      router.replace("/guide");
      return;
    }

    setScenario(storedScenario);
    setHero(storedHero);
    setSuperpower(storedSuperpower);
  }, [router.isReady]);

  if (!router.isReady || !scenario || !hero || !superpower) {
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
      <HeroChat scenario={scenario} hero={hero} superpower={superpower} />
    </main>
  );
}
