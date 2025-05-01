// pages/guide-intro.tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Starfield from "@/components/Starfield";
import GuideIntro from "@/components/GuideIntro";

export default function GuideIntroPage() {
  const router = useRouter();
  const [domain, setDomain] = useState<string | null>(null);

  useEffect(() => {
    const d = localStorage.getItem("echoes_domain");
    if (!d) {
      router.replace("/domains");
    } else {
      setDomain(d);
    }
  }, [router]);

  function pickScenario(s: string) {
    localStorage.setItem("echoes_scenario", s);
    router.push("/guide");
  }

  if (!domain) return null;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4">
      <Starfield />
      <GuideIntro domain={domain} onPick={pickScenario} />
    </main>
  );
}
