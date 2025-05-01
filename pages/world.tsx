// pages/world.tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import WorldReveal from "@/components/WorldReveal";

export default function WorldPage() {
  const router = useRouter();
  const [world, setWorld] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const domain = localStorage.getItem("echoes_domain");
    const w = domain ? localStorage.getItem("echoes_world") : null;
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
          localStorage.setItem("echoes_world", world);
          router.push("/guide-intro");
        }}
      >
        Continue
      </button>
    </main>
  );
}

// Force SSR to prevent static prerender from hitting localStorage
export async function getServerSideProps() {
  return { props: {} };
}
