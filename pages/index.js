// pages/index.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { TAGLINES } from "@/data/landingTaglines";

export default function Landing() {
  const router = useRouter();
  const [tagline, setTagline] = useState("");

  useEffect(() => {
    // pick one tagline at random on each load
    const pick = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
    setTagline(pick);
  }, []);

  return (
    <main
      className="fade"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "0 20px",
      }}
    >
      <h1 style={{ fontSize: "4rem", margin: 0, color: "var(--clr-primary)" }}>
        Echoes
      </h1>
      <p style={{ margin: "16px 0 40px", color: "var(--clr-primary)" }}>
        {tagline}
      </p>
      <button
        className="button-poetic"
        onClick={() => router.push("/onboarding")}
      >
        Get Started
      </button>
    </main>
  );
}
