// pages/world.js

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import WorldReveal from "@/components/WorldReveal";
import { randomWhisper } from "@/utils/whispers";

export default function WorldPage() {
  const router = useRouter();
  const [world,   setWorld]   = useState(null);
  const [whisper, setWhisper] = useState("");
  const timerRef              = useRef(null);

  useEffect(() => {
    // load the assigned world
    const stored = JSON.parse(localStorage.getItem("echoes_world") || "null");
    if (!stored) {
      router.replace("/");
      return;
    }
    setWorld(stored);

    // after 8s idle, show a whisper
    timerRef.current = setTimeout(() => {
      setWhisper(randomWhisper());
    }, 8000);

    return () => clearTimeout(timerRef.current);
  }, []);

  if (!world) return null;

  return (
    <main
      className={`${world.theme} fade`}
      style={{ textAlign: "center", paddingTop: "30vh" }}
    >
      <WorldReveal world={world} />

      {whisper && (
        <p style={{ marginTop: "30px", opacity: 0.7, fontStyle: "italic" }}>
          {whisper}
        </p>
      )}

      <button
        className="button-poetic"
        style={{ marginTop: "40px" }}
        onClick={() => router.push("/guide")}
      >
        Continue
      </button>
    </main>
  );
}
