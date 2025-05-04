// pages/domains.tsx
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

  // 1️⃣ Load answers from localStorage or redirect
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

  // 2️⃣ Fetch 5 domains once answers are ready
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
        setError("Failed to load domains. Please try again.");
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

  // While waiting for domains, show overlay
  if (domains === null) {
    return (
      <main className="relative flex items-center justify-center min-h-screen bg-black text-gold">
        <LatencyOverlay />
      </main>
    );
  }

  // 3️⃣ Handle domain pick
  function handlePick(domain: string) {
    localStorage.setItem("echoes_domain", domain);
    router.push("/guide");
  }

  // 4️⃣ Render domain options with single selection
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <LatencyOverlay />
      <Starfield />
      <h1 className="text-4xl font-serif mb-6">Discover Your Domain</h1>
      {loading && <p className="italic">The echoes are thinking…</p>}
      {error && <p className="text-red-500 italic mb-4" role="alert">{error}</p>}
      {!loading && (
        <ul className="w-full max-w-xl space-y-4">
          {domains.map((domain, i) => (
            <li
              key={i}
              tabIndex={0}
              onClick={() => setSelected(i)}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && setSelected(i)}
              className={`p-4 border rounded cursor-pointer transition-colors duration-150 ${
                selected === i
                  ? "border-gold bg-gold/10 ring-2 ring-gold"
                  : "border-gold/40"
              }`}
              aria-pressed={selected === i}
              aria-label={`Select domain ${domain}`}
            >
              {domain}
            </li>
          ))}
        </ul>
      )}
      <button
        className="btn-primary w-full py-3 mt-6"
        disabled={selected === null}
        onClick={() => {
          if (selected !== null) handlePick(domains[selected]);
        }}
        aria-disabled={selected === null}
      >
        Continue
      </button>
    </main>
  );
}
