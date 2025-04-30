// pages/index.js
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
    <main className="relative flex flex-col items-center justify-center min-h-screen text-center">
      <Starfield />
      <h1 className="text-[4rem] font-serif fade">Echoes</h1>
      <p className="fade mt-4 mb-12 max-w-xs">
        Your soul remembers. <br />Step through the Echoes.
      </p>

      <button
        className="btn-primary fade-in"
        style={{ "--delay": "0.2s" }}
        onClick={() => router.push("/onboarding")}
      >
        Start Journey
      </button>

      <button
        className="btn-outline fade-in mt-4"
        style={{ "--delay": "0.4s" }}
        onClick={() => router.push("/codex")}
      >
        View Codex
      </button>
    </main>
  );
}
