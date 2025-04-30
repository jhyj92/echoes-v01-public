// File: pages/world.js

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useHydratedState from "@/hooks/useHydratedState";
import WorldReveal from "@/components/WorldReveal";
import { randomWhisper } from "@/utils/whispers";
import FadeIn from "@/components/FadeIn";

export default function WorldPage() {
  const router = useRouter();
  const world  = useHydratedState("echoes_world", null);
  const [whisper, setWhisper] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    if (!world) {
      router.replace("/");
      return;
    }
    timerRef.current = setTimeout(() => {
      setWhisper(randomWhisper());
    }, 8000);
    return () => clearTimeout(timerRef.current);
  }, [world, router]);

  if (!world) return null;

  return (
    <main className={`${world.theme}`} style={{ textAlign: "center", paddingTop: "30vh" }}>
      <FadeIn delay={0}>
        <WorldReveal world={world} />
      </FadeIn>

      {whisper && (
        <FadeIn delay={0.5}>
          <p style={{ marginTop: "30px", opacity: 0.7, fontStyle: "italic" }}>{whisper}</p>
        </FadeIn>
      )}

      <FadeIn delay={1}>
        <button className="button-poetic" style={{ marginTop: "40px" }} onClick={() => router.push("/guide")}>Continue</button>
      </FadeIn>
    </main>
  );
}
