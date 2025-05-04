"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Starfield from "@/components/Starfield";
import LatencyOverlay from "@/components/LatencyOverlay";
import GuideIntro from "@/components/GuideIntro";
import HeroSelector, { HeroOption } from "@/components/HeroSelector";
import SuperpowerReveal from "@/components/SuperpowerReveal"; // NEW

export default function GuidePage() {
  const router = useRouter();
  const [domain, setDomain] = useState<string | null>(null);
  const [reflections, setReflections] = useState<string[]>([]);
  const [superpower, setSuperpower] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroOptions, setHeroOptions] = useState<HeroOption[] | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const storedDomain = localStorage.getItem("echoes_domain");
    if (!storedDomain) {
      router.replace("/domains");
      return;
    }
    setDomain(storedDomain);

    const storedGuide = localStorage.getItem("echoes_guide");
    if (storedGuide) {
      try {
        setReflections(JSON.parse(storedGuide));
      } catch {
        setReflections([]);
      }
    }
  }, [router.isReady]);

  // After 10 reflections, get superpower
  useEffect(() => {
    if (reflections.length === 10 && domain && !superpower) {
      setLoading(true);
      setError(null);
      fetch("/api/superpower", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, reflections }),
      })
        .then(res => {
          if (!res.ok) throw new Error(`API error: ${res.status}`);
          return res.json();
        })
        .then(data => setSuperpower(data.superpower || ""))
        .catch(() => setError("Failed to synthesize your superpower."))
        .finally(() => setLoading(false));
    }
  }, [reflections, domain, superpower]);

  // After superpower is revealed and user continues, fetch hero options
  const handleSuperpowerContinue = () => {
    if (!domain || !reflections.length || !superpower) return;
    setLoading(true);
    setError(null);
    fetch("/api/suggestHeroScenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, reflections, superpower }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(data => setHeroOptions(data.options))
      .catch(() => setError("Failed to fetch hero options."))
      .finally(() => setLoading(false));
  };

  const handleComplete = (answers: string[]) => {
    setReflections(answers);
    localStorage.setItem("echoes_guide", JSON.stringify(answers));
  };

  const handleHeroSelect = (hero: string, scenario: string) => {
    localStorage.setItem("echoes_hero", hero);
    localStorage.setItem("echoes_scenario", scenario);
    localStorage.setItem("echoes_superpower", superpower || "");
    router.push("/hero");
  };

  const handleRestart = () => {
    localStorage.removeItem("echoes_guide");
    localStorage.removeItem("echoes_hero");
    localStorage.removeItem("echoes_scenario");
    localStorage.removeItem("echoes_superpower");
    router.replace("/domains");
  };

  if (!domain) return null;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <Starfield />
      <LatencyOverlay />
      {error && <div className="text-red-500 italic mb-4">{error}</div>}

      {reflections.length < 10 && (
        <GuideIntro
          domain={domain}
          onComplete={handleComplete}
          initialAnswers={reflections}
        />
      )}

      {reflections.length === 10 && !superpower && loading && (
        <p className="italic mt-4">The echoes are discovering your superpower…</p>
      )}

      {reflections.length === 10 && superpower && !heroOptions && (
        <SuperpowerReveal
          superpower={superpower}
          onContinue={handleSuperpowerContinue}
        />
      )}

      {reflections.length === 10 && heroOptions && (
        <>
          <HeroSelector options={heroOptions} onSelect={handleHeroSelect} />
          <button
            className="btn-secondary mt-6"
            onClick={handleRestart}
          >
            Restart Guide
          </button>
        </>
      )}

      {loading && heroOptions && <p className="italic mt-4">The echoes are preparing your next step…</p>}
    </main>
  );
}
