// File: pages/index.js

import { useEffect } from "react";
import { useRouter } from "next/router";
import useHydratedState from "@/hooks/useHydratedState";

export default function Landing() {
  const router = useRouter();
  const world  = useHydratedState("echoes_world", null);
  const traits = useHydratedState("echoes_traits", []);

  // Returning users skip to guide
  useEffect(() => {
    if (world && traits.length) {
      router.replace("/guide");
    }
  }, [world, traits, router]);

  return (
    <main
      className="fade"
      style={{ textAlign: "center", padding: "10vh 20px" }}
    >
      <h1 style={{ fontSize: "4rem", margin: 0, color: "var(--clr-primary)" }}>
        Echoes
      </h1>
      <p style={{ margin: "16px 0 40px", color: "var(--clr-primary)" }}>
        Your soul remembers. Step through the Echoes.
      </p>
      <button
        className="button-poetic"
        style={{ fontSize: "1.2rem", padding: "12px 28px" }}
        onClick={() => router.push("/onboarding")}
      >
        Get Started
      </button>
    </main>
  );
}
