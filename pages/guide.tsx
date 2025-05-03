// /pages/guide.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LatencyOverlay from "../components/LatencyOverlay";
import Starfield from "../components/Starfield";
import GuideIntro from "../components/GuideIntro";
import HeroChat from "../components/HeroChat";

export default function GuidePage() {
  const router = useRouter();
  const [scenario, setScenario] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedScenario = localStorage.getItem("echoes_scenario");
    const domain = localStorage.getItem("echoes_domain");

    if (!domain) {
      router.replace("/domains");
      return;
    }

    if (storedScenario) {
      setScenario(storedScenario);
      setLoading(false);
      return;
    }

    const fetchScenarios = async () => {
      try {
        const res = await fetch("/api/guideIntro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain }),
        });

        if (!res.ok) throw new Error("Failed to fetch scenarios");
        const data = await res.json();
        setScenarios(data.scenarios || []);
      } catch (err) {
        console.error(err);
        setScenarios(["A mysterious path appears...", "An unknown journey beckons..."]);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, [router]);

  const handleSelect = (selected: string) => {
    localStorage.setItem("echoes_scenario", selected);
    setScenario(selected);
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <LatencyOverlay />
      <Starfield />

      {!loading && !scenario && (
        <GuideIntro scenarios={scenarios} onSelect={handleSelect} />
      )}

      {!loading && scenario && (
        <HeroChat scenario={scenario} />
      )}
    </main>
  );
}
