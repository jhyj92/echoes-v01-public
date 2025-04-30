"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";
import Starfield from "@/components/Starfield";
import useHydratedState from "@/hooks/useHydratedState";

export default function Landing() {
  const router = useRouter();
  const world  = useHydratedState("echoes_world", null);
  const traits = useHydratedState("echoes_traits", []);

  useEffect(() => {
    if (world && traits.length) router.replace("/guide");
  }, [world, traits, router]);

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen text-center text-gold">
      <Starfield />
      <img src="/icons/crescent.svg" alt="" className="w-20 mb-10" />
      <h1 className="text-6xl font-serif mb-6">Echoes</h1>
      <p className="max-w-xs mx-auto mb-12">
        Your soul remembers. <br />Step through the Echoes.
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
