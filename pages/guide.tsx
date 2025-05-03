"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LatencyOverlay from "../components/LatencyOverlay";
import Starfield from "../components/Starfield";
import GuideIntro from "../components/GuideIntro";
import HeroChat from "../components/HeroChat";

export default function GuidePage() {
  const router = useRouter();
  const [domain, setDomain] = useState<string | null>(null);
  const [scenario, setScenario] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const storedDomain = localStorage.getItem("echoes_domain");
    const storedScenario = localStorage.getItem("echoes_scenario");

    if (!storedDomain) {
      router.replace("/domains");
      return;
    }

    setDomain(storedDomain);

    if (storedScenario) {
      setScenario(storedScenario);
    }
  }, [router.isReady]);

  const handleSelect = (selected: string) => {
    localStorage.setItem("echoes_scenario", selected);
    setScenario(selected);
  };

  if (!router.isReady || !domain) return null;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <LatencyOverlay />
      <Starfield />

      {!scenario && (
        <GuideIntro domain={domain} onSelect={handleSelect} />
      )}

      {scenario && (
        <HeroChat scenario={scenario} />
      )}
    </main>
  );
}
