// pages/domains.tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Starfield from "@/components/Starfield";
import DomainSelector from "@/components/DomainSelector";

export default function DomainsPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[] | null>(null);
  const [domains, setDomains] = useState<string[] | null>(null);

  // 1️⃣ load answers from storage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = JSON.parse(localStorage.getItem("echoes_answers") || "[]");
    if (!stored.length) {
      router.replace("/onboarding");
    } else {
      setAnswers(stored);
    }
  }, [router]);

  // 2️⃣ fetch 5 domains once answers are ready
  useEffect(() => {
    if (!answers) return;
    (async () => {
      try {
        const res = await fetch("/api/domains", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        const data = await res.json();
        setDomains(data.suggestions);
      } catch {
        setDomains(["Curiosity", "Courage", "Reflection", "Discovery", "Wonder"]);
      }
    })();
  }, [answers]);

  if (domains === null) {
    return null; // or a loading spinner
  }

  function pick(d: string) {
    localStorage.setItem("echoes_domain", d);
    router.push("/guide-intro");
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4">
      <Starfield />
      <h1 className="text-4xl font-serif text-gold mb-6">Discover Your Domain</h1>
      <DomainSelector domains={domains} onSelect={pick} />
    </main>
  );
}
