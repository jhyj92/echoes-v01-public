"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Starfield from "@/components/Starfield";
import LatencyOverlay from "@/components/LatencyOverlay";
import GuideIntro from "@/components/GuideIntro";
import HeroSelector, { HeroOption } from "@/components/HeroSelector";

export default function GuidePage() {
  const router = useRouter();
  const [domain, setDomain] = useState<string | null>(null);
  const [reflections, setReflections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroOptions, setHeroOptions] = useState<HeroOption[] | null>(null);

  // Load selected domain from localStorage
  useEffect(() => {
    if (!router.isReady) return;
    const storedDomain = localStorage.getItem("echoes_domain");
    if (!storedDomain) {
      router.replace("/domains");
      return;
    }
    setDomain(storedDomain);
  }, [router.isReady]);

  // After 10 reflections, fetch hero options
  useEffect(() => {
    if (reflections.length === 10 && domain) {
      (async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch("/api/suggestHeroScenario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reflections, domain }),
          });
          const data = await res.json();
          setHeroOptions(data.options);
        } catch (err) {
          setError("Failed to fetch hero options.");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [reflections, domain]);

  // Handle reflection completion
  const handleComplete = (answers: string[]) => {
    setReflections(answers);
    localStorage.setItem("echoes_guide", JSON.stringify(answers));
  };

  // Handle hero selection (proceed to next step)
  const handleHeroSelect = (hero: string, scenario: string) => {
    localStorage.setItem("echoes_hero", hero);
    localStorage.setItem("echoes_scenario", scenario);
    router.push("/hero");
  };

  if (!domain) return null;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <Starfield />
      <LatencyOverlay />
      {error && <div className="text-red-500 italic mb-4">{error}</div>}

      {/* Reflection questions */}
      {reflections.length < 10 && (
        <GuideIntro
          domain={domain}
          onComplete={handleComplete}
          initialAnswers={reflections}
        />
      )}

      {/* Hero selection */}
      {reflections.length === 10 && heroOptions && (
        <HeroSelector options={heroOptions} onSelect={handleHeroSelect} />
      )}
    </main>
  );
}
