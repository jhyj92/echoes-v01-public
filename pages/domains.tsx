"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Starfield from "@/components/Starfield";
import LatencyOverlay from "@/components/LatencyOverlay";
import DomainSelector from "@/components/DomainSelector";

export default function DomainsPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[] | null>(null);
  const [domains, setDomains] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = JSON.parse(localStorage.getItem("echoes_answers") || "[]");
      if (!Array.isArray(stored) || stored.length === 0) {
        router.replace("/onboarding");
      } else {
        setAnswers(stored);
      }
    } catch {
      setError("Could not load your previous answers.");
    }
  }, [router]);

  useEffect(() => {
    if (!answers) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch("/api/domains", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const { suggestions } = await res.json();
        if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
          throw new Error("No domains returned.");
        }
        setDomains(suggestions);
      } catch (err) {
        setError("Failed to load domains. Using fallback list.");
        setDomains([
          "Curiosity",
          "Courage",
          "Reflection",
          "Discovery",
          "Wonder",
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [answers]);

  if (domains === null) {
    return (
      <main className="relative flex items-center justify-center min-h-screen bg-black text-gold">
        <LatencyOverlay />
      </main>
    );
  }

  function handlePick(domain: string) {
    localStorage.setItem("echoes_domain", domain);
    router.push("/guide");
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <LatencyOverlay />
      <Starfield />
      <h1 className="text-4xl font-serif mb-6">Discover Your Domain</h1>
      {loading && <p className="italic">The echoes are thinking…</p>}
      {error && <p className="text-red-500 italic mb-4" role="alert">{error}</p>}
      {!loading && (
        <>
          <DomainSelector domains={domains} onSelect={handlePick} />
          <button
            className="btn-secondary mt-4"
            onClick={() => {
              localStorage.removeItem("echoes_answers");
              router.push("/onboarding");
            }}
          >
            Restart Interview
          </button>
        </>
      )}
    </main>
  );
}
