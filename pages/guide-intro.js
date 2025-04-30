// File: pages/guide-intro.js

"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import GuideIntro from "@/components/GuideIntro";

export default function GuideIntroPage() {
  const router = useRouter();
  const [domain, setDomain] = useState(null);

  useEffect(() => {
    const d = localStorage.getItem("echoes_domain");
    if (!d) {
      router.replace("/domains");
    } else {
      setDomain(d);
    }
  }, [router]);

  function handlePick(scenario) {
    localStorage.setItem("echoes_scenario", scenario);
    router.push("/hero-chat");
  }

  // Don't render until domain is loaded
  if (!domain) return null;

  return <GuideIntro domain={domain} onPick={handlePick} />;
}
