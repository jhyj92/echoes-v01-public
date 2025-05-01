// pages/guide.js
"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";
import Starfield from "@/components/Starfield";
import HeroChat from "@/components/HeroChat";

export default function GuidePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const scenario = localStorage.getItem("echoes_scenario");
    if (!scenario) router.replace("/guide-intro");
  }, [router]);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4">
      <Starfield />
      <HeroChat />
    </main>
  );
}
