// pages/world.js

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import useHydratedState from "@/hooks/useHydratedState";
import WorldReveal from "@/components/WorldReveal";
import { randomWhisper } from "@/utils/whispers";
import FadeIn from "@/components/FadeIn";

export default function WorldPage() {
  const router = useRouter();
  const world  = useHydratedState("echoes_world", null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!world) {
      router.replace("/");
      return;
    }
    timerRef.current = setTimeout(() => {
      // whisper logic unchanged
    }, 8000);
    return () => clearTimeout(timerRef.current);
  }, [world, router]);

  if (!world) return null;

  return (
    <main className={`${world.theme}`} style={{ textAlign: "center", paddingTop: "30vh" }}>
      <FadeIn delay={0}>
        <WorldReveal world={world} />
      </FadeIn>
      {/* Whisper and Continue button as before */}
    </main>
  );
}
