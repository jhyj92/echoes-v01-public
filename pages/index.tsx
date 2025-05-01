// pages/index.tsx
import { useRouter } from "next/router";
import useHydratedState from "@/hooks/useHydratedState";

export default function Landing() {
  const router = useRouter();
  const world  = useHydratedState<string | null>("echoes_world", null);
  const traits = useHydratedState<string[]>("echoes_traits", []);

  // ── If the visitor already finished onboarding, drop them in /guide ──
  if (world && traits.length) router.replace("/guide");

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen text-center px-4">
      {/* heading */}
      <h1 className="text-6xl md:text-7xl font-serif tracking-wide fade">
        Echoes
      </h1>

      <p className="fade mt-4 mb-12 max-w-xs text-gold/90">
        Your soul remembers.<br />Step through the&nbsp;Echoes.
      </p>

      {/* cta buttons */}
      <div className="space-x-3">
        <button
          className="btn-primary fade-in"
          style={{ ["--delay" as any]: "0.2s" }}
          onClick={() => router.push("/onboarding")}
        >
          Start Journey
        </button>
        <button
          className="btn-outline fade-in"
          style={{ ["--delay" as any]: "0.4s" }}
          onClick={() => router.push("/codex")}
        >
          View Codex
        </button>
      </div>
    </main>
  );
}
