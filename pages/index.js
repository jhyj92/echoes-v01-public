// pages/index.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import useHydratedState from "@/hooks/useHydratedState";

export default function Landing() {
  const router = useRouter();
  const world  = useHydratedState("echoes_world", null);
  const traits = useHydratedState("echoes_traits", []);

  // returning visitors jump straight to guide
  useEffect(() => {
    if (world && traits.length) router.replace("/guide");
  }, [world, traits, router]);

  return (
    <main className="fade" style={{ textAlign:"center", padding:"10vh 20px" }}>
      <h1 style={{ fontSize:"4rem", color:"var(--clr-primary)", margin:0 }}>Echoes</h1>
      <p style={{ margin:"16px 0 40px", color:"var(--clr-primary)" }}>
        Your soul remembers. Step through the Echoes.
      </p>
      {/* ↪ advance to the next phase */}
      <button
        className="button-poetic"
        style={{ fontSize:"1.2rem", padding:"12px 28px" }}
        onClick={() => router.push("/domains")}
      >
        Get Started
      </button>
    </main>
  );
}
