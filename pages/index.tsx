// pages/index.tsx
"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";
import Starfield from "@/components/Starfield";
import useHydratedState from "@/hooks/useHydratedState";

export default function Landing() {
  const router = useRouter();
  const domain = useHydratedState<string | null>("echoes_domain", null);
  const superpower = useHydratedState<string | null>("echoes_superpower", null);

  useEffect(() => {
    if (superpower) {
      router.replace("/hero");
    } else if (domain) {
      router.replace("/guide");
    }
  }, [domain, superpower, router]);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen text-center bg-black">
      <Starfield />
      <h1 className="text-6xl font-serif text-gold mb-4">Echoes</h1>
      <p className="text-xl mb-12 max-w-md">
        Your soul remembers.<br/>Step through the Echoes.
      </p>
      <button
        className="btn-primary mb-4"
        onClick={() => router.push("/onboarding")}
      >
        Start Journey
      </button>
      <button
        className="btn-outline"
        onClick={() => router.push("/codex")}
      >
        View Codex
      </button>
    </main>
  );
}
