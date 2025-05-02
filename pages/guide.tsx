// pages/guide.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Starfield from "@/components/Starfield";
import LatencyOverlay from "@/components/LatencyOverlay";
import GuideIntro from "@/components/GuideIntro";
import HeroChat from "@/components/HeroChat";

export default function GuidePage() {
  const router = useRouter();
  const [domain, setDomain] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1️⃣ Ensure a domain is selected
  useEffect(() => {
    if (typeof window === "undefined") return;
    const d = localStorage.getItem("echoes_domain");
    if (!d) {
      router.replace("/domains");
    } else {
      setDomain(d);
    }
  }, [router]);

  // 2️⃣ Handle scenario selection
  const handlePick = (scenario: string) => {
    setSelectedScenario(scenario);
    localStorage.setItem("echoes_scenario", scenario);
  };

  // 3️⃣ Render
  if (!domain) return null;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <LatencyOverlay />
      <Starfield />

      {loading && <p className="italic mt-4">The echoes are shaping your path…</p>}

      {!loading && !selectedScenario && (
        <GuideIntro domain={domain} onPick={handlePick} />
      )}

      {!loading && selectedScenario && (
        <HeroChat scenario={selectedScenario} />
      )}
    </main> {/* ✅ THIS is correct */}
  );
}
