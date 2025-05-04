import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LatencyOverlay from "../components/LatencyOverlay";
import Starfield from "../components/Starfield";
import GuideIntro from "../components/GuideIntro";
import HeroSelector, { HeroOption } from "../components/HeroSelector";
import HeroChat from "../components/HeroChat";

export default function GuidePage() {
  const router = useRouter();
  const [domain, setDomain] = useState<string | null>(null);
  const [scenario, setScenario] = useState<string | null>(null);
  const [hero, setHero] = useState<string | null>(null);
  const [heroOptions, setHeroOptions] = useState<HeroOption[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, load domain, hero, scenario from localStorage
  useEffect(() => {
    if (!router.isReady) return;

    try {
      const storedDomain = localStorage.getItem("echoes_domain");
      const storedScenario = localStorage.getItem("echoes_scenario");
      const storedHero = localStorage.getItem("echoes_hero");

      if (!storedDomain) {
        router.replace("/domains");
        return;
      }

      setDomain(storedDomain);

      if (storedScenario && storedHero) {
        setScenario(storedScenario);
        setHero(storedHero);
      } else {
        // If domain changes, reset hero/scenario
        setScenario(null);
        setHero(null);
        localStorage.removeItem("echoes_hero");
        localStorage.removeItem("echoes_scenario");
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router.isReady]);

  // After 10 reflections, get hero options from API
  const handleReflectionsComplete = async (reflections: string[]) => {
    setError(null);
    setHeroOptions(null);
    setIsLoading(true);
    try {
      localStorage.setItem("echoes_guide", JSON.stringify(reflections));
      const res = await fetch("/api/suggestHeroScenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflections, domain }),
      });
      if (!res.ok) throw new Error("Failed to fetch hero options.");
      const data = await res.json();
      setHeroOptions(data.options);
    } catch (error) {
      setError("Failed to fetch hero options. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // When user selects a hero/scenario
  const handleHeroSelect = (hero: string, scenario: string) => {
    localStorage.setItem("echoes_hero", hero);
    localStorage.setItem("echoes_scenario", scenario);
    setHero(hero);
    setScenario(scenario);
  };

  if (!router.isReady || isLoading) {
    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
        <LatencyOverlay />
        <Starfield />
        <div className="text-center">Loading your journey...</div>
      </main>
    );
  }

  if (!domain) return null;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <LatencyOverlay />
      <Starfield />
      {error && (
        <div className="text-red-500 italic mb-4" role="alert">{error}</div>
      )}

      {!scenario && !heroOptions && (
        <GuideIntro domain={domain} onSelect={handleReflectionsComplete} />
      )}

      {!scenario && heroOptions && (
        <HeroSelector options={heroOptions} onSelect={handleHeroSelect} />
      )}

      {scenario && hero && (
        <HeroChat hero={hero} scenario={scenario} />
      )}
    </main>
  );
}
