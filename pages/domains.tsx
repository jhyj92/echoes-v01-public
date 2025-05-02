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
  const [loading, setLoading] = useState<boolean>(false);

  // 1️⃣ Load answers from localStorage or redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = JSON.parse(localStorage.getItem("echoes_answers") || "[]");
    if (!Array.isArray(stored) || stored.length === 0) {
      router.replace("/onboarding");
    } else {
      setAnswers(stored);
    }
  }, [router]);

  // 2️⃣ Fetch 5 domains once answers are ready
  useEffect(() => {
    if (!answers) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/domains", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        const { suggestions } = await res.json();
        setDomains(suggestions);
      } catch {
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

  // While waiting for domains, show nothing or overlay
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
    router.push("/guide-intro");
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <LatencyOverlay />
      <Starfield />
      <h1 className="text-4xl font-serif mb-6">Discover Your Domain</h1>
      {loading ? (
        <p className="italic">The echoes are thinking…</p>
      ) : (
        <DomainSelector domains={domains} onSelect={handlePick} />
      )}
    </main>
  );
}
