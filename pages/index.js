"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TraitForm from "@/components/TraitForm";
import assignWorldWeighted from "@/utils/assignWorldWeighted";
import categoriseDomains from "@/utils/categoriseDomains";
import { useLocalState } from "@/hooks/useLocalState";

export default function Home() {
  const [world] = useLocalState("echoes_world", null);
  const router  = useRouter();

  // returning users jump straight to /guide
  useEffect(() => {
    const traits = JSON.parse(localStorage.getItem("echoes_traits") || "[]");
    if (world && traits.length) router.replace("/guide");
  }, []);

  return (
    <main className="theme-base">
      <TraitForm
        onSubmit={(traits) => {
          const w = assignWorldWeighted(traits);
          const d = categoriseDomains(traits);

          localStorage.setItem("echoes_traits", JSON.stringify(traits));
          localStorage.setItem("echoes_domain", JSON.stringify(d));
          localStorage.setItem("echoes_world",  JSON.stringify(w));

          router.push("/world");           // ▶ flow: reveal world first
        }}
      />
    </main>
  );
}
