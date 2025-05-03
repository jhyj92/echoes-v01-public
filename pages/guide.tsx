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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;

    try {
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
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router.isReady]);

  // Now expects reflections array
  const handleSelect = (reflections: string[]) => {
    try {
      localStorage.setItem("echoes_guide", JSON.stringify(reflections));
      // Here you could generate/select a scenario, for now just set a default or let user pick
      const scenario = "A hero faces a challenge only your superpower can solve.";
      localStorage.setItem("echoes_scenario", scenario);
      setScenario(scenario);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
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

      {!scenario && (
        <GuideIntro domain={domain} onSelect={handleSelect} />
      )}

      {scenario && (
        <HeroChat scenario={scenario} />
      )}
    </main>
  );
}
