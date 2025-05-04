"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LatencyOverlay from "@/components/LatencyOverlay";
import Starfield from "@/components/Starfield";
import ReflectionLetter from "@/components/ReflectionLetter";
import { addCodexJourney } from "@/utils/codexManager";

export default function ReflectionPage() {
  const router = useRouter();
  const [letter, setLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const history = localStorage.getItem("echoes_history");
    const superpower = localStorage.getItem("echoes_superpower");
    const scenario = localStorage.getItem("echoes_scenario");
    const hero = localStorage.getItem("echoes_hero");
    const domain = localStorage.getItem("echoes_domain");

    if (!history || !superpower || !scenario || !hero || !domain) {
      router.replace("/hero");
      return;
    }

    const fetchLetter = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/reflectionLetter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: JSON.parse(history),
            scenario,
            hero,
            superpower,
          }),
        });

        if (!res.ok) throw new Error("Failed to fetch reflection letter");
        const data = await res.json();
        setLetter(data.letter);
      } catch (err) {
        console.error(err);
        setError("Could not generate reflection letter. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLetter();
  }, [router]);

  const handleSave = () => {
    const superpower = localStorage.getItem("echoes_superpower");
    const domain = localStorage.getItem("echoes_domain");
    const hero = localStorage.getItem("echoes_hero");
    if (letter && domain && hero && superpower) {
      addCodexJourney({
        domain,
        hero,
        superpower,
        letter,
        note,
      });
      setSaved(true);
    }
  };

  const handleContinue = () => {
    localStorage.removeItem("echoes_history");
    router.replace("/hero");
  };

  const handleRetry = () => {
    setLetter(null);
    setError(null);
    setLoading(true);
    router.replace(router.asPath);
  };

  const handleRestart = () => {
    localStorage.clear();
    router.replace("/");
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <LatencyOverlay />
      <Starfield />

      {loading ? (
        <p className="text-xl animate-fade-in">The echoes are composing your reflection…</p>
      ) : error ? (
        <section className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <button onClick={handleRetry} className="btn-primary">
            Retry
          </button>
          <button onClick={handleRestart} className="btn-secondary ml-4">
            Restart Experience
          </button>
        </section>
      ) : !saved ? (
        <section className="w-full max-w-2xl space-y-6 text-gold text-center">
          <ReflectionLetter letter={letter ?? ""} onContinue={() => {}} />
          <input
            type="text"
            placeholder="Add a note about this reflection (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full rounded bg-transparent border border-gold/40 px-3 py-2 mt-4"
          />
          <button onClick={handleSave} className="btn-primary mt-2">
            Save to Codex
          </button>
        </section>
      ) : (
        <section className="text-center space-y-4">
          <p className="text-green-400">Saved to your Codex!</p>
          <button onClick={handleContinue} className="btn-primary">
            Continue
          </button>
        </section>
      )}
    </main>
  );
}
