import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LatencyOverlay from "@/components/LatencyOverlay";
import Starfield from "@/components/Starfield";
import GuideIntro from "@/components/GuideIntro";
import HeroChat from "@/components/HeroChat";

export default function GuidePage() {
  const router = useRouter();
  const [domain, setDomain] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  useEffect(() => {
    const savedDomain = localStorage.getItem("echoes_domain");
    if (!savedDomain) {
      router.push("/domains");
      return;
    }
    setDomain(savedDomain);

    fetch("/api/guideIntro", {
      method: "POST",
      body: JSON.stringify({ domain: savedDomain }),
    })
      .then((res) => res.json())
      .then((data) => {
        setScenarios(data?.scenarios || []);
        setLoading(false);
      });
  }, []);

  const handleSelect = (scenario: string) => {
    localStorage.setItem("echoes_scenario", scenario);
    setSelectedScenario(scenario);
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <LatencyOverlay />
      <Starfield />

      {!loading && !selectedScenario && (
        <GuideIntro scenarios={scenarios} onSelect={handleSelect} />
      )}

      {!loading && selectedScenario && (
        <HeroChat scenario={selectedScenario} />
      )}
    </main>
  );
}
