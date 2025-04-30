"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import GuideIntro from "@/components/GuideIntro";

export default function GuideIntroPage() {
  const router = useRouter();
  const [domain, setDomain] = useState<string | null>(null);

  useEffect(() => {
    const d = localStorage.getItem("echoes_domain");
    if (!d) router.replace("/domains");
    else setDomain(d);
  }, [router]);

  const pickScenario = (s: string) => {
    localStorage.setItem("echoes_scenario", s);
    router.push("/hero-chat");
  };

  if (!domain) return null;
  return <GuideIntro domain={domain} onPick={pickScenario} />;
}
