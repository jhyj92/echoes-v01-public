// pages/world.js
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import WorldReveal from "@/components/WorldReveal";

export default function WorldPage() {
  const router = useRouter();
  const [world, setWorld] = useState<string | null>(null);

  // Load assigned world or redirect back to domains
  useEffect(() => {
    const w = localStorage.getItem("echoes_domain")     // domain first
      ? localStorage.getItem("echoes_world")            // then world
      : null;
    if (!w) {
      router.replace("/domains");
    } else {
      setWorld(w);
    }
  }, [router]);

  if (!world) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <WorldReveal world={world} />

      <button
        className="btn-primary mt-8"
        onClick={() => {
          // Persist and advance
          localStorage.setItem("echoes_world", world);
          router.push("/guide-intro");
        }}
      >
        Continue
      </button>
    </main>
  );
}
