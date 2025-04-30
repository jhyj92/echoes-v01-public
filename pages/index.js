// pages/index.js

"use client";

import { useRouter } from "next/router";
import useHydratedState from "@/hooks/useHydratedState";

export default function Landing() {
  const router = useRouter();
  // Hydrate world and traits safely
  const world  = useHydratedState("echoes_world", null);
  const traits = useHydratedState("echoes_traits", []);

  // Returning users skip to guide
  if (world && traits.length) {
    router.replace("/guide");
    return null;
  }

  return (
    <main className="fade" style={{ textAlign: "center", padding: "10vh 20px" }}>
      <h1 style={{ fontSize: "4rem", margin: 0, color: "var(--clr-primary)" }}>
        Echoes
      </h1>
      <p style={{ margin: "16px 0 40px", color: "var(--clr-primary)" }}>
        Your soul remembers. Step through the Echoes.
      </p>
      <button className="button-poetic" onClick={() => router.push("/onboarding")}>
        Get Started
      </button>
    </main>
  );
}
