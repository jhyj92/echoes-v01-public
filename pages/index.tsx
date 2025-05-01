// pages/index.tsx
"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";
import Starfield from "@/components/Starfield";
import useHydratedState from "@/hooks/useHydratedState";

export default function Landing() {
  const router = useRouter();
  const world  = useHydratedState("echoes_world", null);
  const traits = useHydratedState("echoes_traits", []);

  // if we've already answered and selected a world, jump straight to the guide
  useEffect(() => {
    if (world && Array.isArray(traits) && traits.length > 0) {
      router.replace("/guide");
    }
  }, [world, traits, router]);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen text-center">
      <Starfield />

      <h1
        className="text-[4rem] font-serif text-gold fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        Echoes
      </h1>

      <p
        className="mt-4 mb-12 max-w-xs text-gold/90 fade-in"
        style={{ animationDelay: "0.4s" }}
      >
        Your soul remembers.
        <br />
        Step through the Echoes.
      </p>

      <button
        className="btn-primary fade-in"
        style={{ animationDelay: "0.6s" }}
        onClick={() => router.push("/onboarding")}
      >
        Start Journey
      </button>

      <button
        className="btn-outline fade-in mt-4"
        style={{ animationDelay: "0.8s" }}
        onClick={() => router.push("/codex")}
      >
        View Codex
      </button>
    </main>
  );
}
