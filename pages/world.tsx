// pages/world.tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Starfield from "@/components/Starfield";
import WorldReveal from "@/components/WorldReveal";

export default function WorldPage() {
  const router = useRouter();
  const [world, setWorld] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("echoes_world");
    if (!stored) {
      router.replace("/domains");
    } else {
      setWorld(stored);
    }
  }, [router]);

  if (!world) return null;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <Starfield />
      <WorldReveal world={world} />
      <button
        className="btn-primary mt-8"
        onClick={() => router.push("/guide-intro")}
      >
        Continue
      </button>
    </main>
  );
}
