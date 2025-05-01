// pages/index.tsx
"use client";

import { useRouter } from "next/router";
import Starfield from "@/components/Starfield";
import useHydratedState from "@/hooks/useHydratedState";

export default function Landing() {
  const router = useRouter();

  // ── Hydrated values (generic hook now understands the <T> syntax) ──
  const world  = useHydratedState<string | null>("echoes_world", null);
  const traits = useHydratedState<string[]>("echoes_traits", []);

  // If the visitor already finished onboarding, drop them in /guide
  if (world && traits.length) {
    if (typeof window !== "undefined") router.replace("/guide");
    return null;
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen text-center">
      <Starfield />

      <h1 className="text-[4rem] font-serif fade">Echoes</h1>
      <p className="fade mt-4 mb-12 max-w-xs">
        Your soul remembers. <br />Step through the Echoes.
      </p>

      <button
        className="btn-primary fade-in"
        style={{ ["--delay" as any]: "0.2s" }}  // <— typed workaround
        onClick={() => router.push("/onboarding")}
      >
        Start Journey
      </button>

      <button
        className="btn-outline fade-in mt-4"
        style={{ ["--delay" as any]: "0.4s" }}
        onClick={() => router.push("/codex")}
      >
        View Codex
      </button>
    </main>
  );
}
