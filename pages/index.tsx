/* ----------------------------------------------------------------
   Landing  ▸  Starfield + centred content + responsive buttons
-----------------------------------------------------------------*/
"use client";

import { useRouter } from "next/router";
import Starfield from "@/components/Starfield";
import useHydratedState from "@/hooks/useHydratedState";

export default function Landing() {
  const router = useRouter();
  const world  = useHydratedState<string | null>("echoes_world", null);
  const traits = useHydratedState<string[]>("echoes_traits", []);

  /* If visitor completed onboarding, drop them into /guide immediately */
  if (typeof window !== "undefined" && world && traits.length) {
    router.replace("/guide");
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4">
      <Starfield />

      <h1 className="text-5xl md:text-6xl font-serif text-gold mb-4 fade">
        Echoes
      </h1>
      <p className="text-center max-w-xs md:max-w-md fade mb-10">
        Your soul remembers.
        <br />
        Step through the Echoes.
      </p>

      <div className="flex gap-3 fade-in" style={{ "--delay": "0.2s" } as any}>
        <button
          className="btn-primary"
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
      </div>
    </main>
  );
}
