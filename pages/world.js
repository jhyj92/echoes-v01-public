// World reveal screen – pages/world.js
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import WorldReveal from "@/components/WorldReveal";

export default function WorldPage() {
  const router        = useRouter();
  const [world, setW] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("echoes_world") || "null");
    if (!stored) {
      router.replace("/");
      return;
    }
    setW(stored);
  }, []);

  if (!world) return null;

  return (
    <main className={world.theme}>
      <WorldReveal world={world} />
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          onClick={() => router.push("/guide")}
          style={{ padding: "10px 24px", background: "#555", color: "#fff", border: "none", cursor: "pointer" }}
        >
          Continue
        </button>
      </div>
    </main>
  );
}
