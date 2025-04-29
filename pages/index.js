"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TraitForm from "@/components/TraitForm";
import WorldReveal from "@/components/WorldReveal";
import assignWorldWeighted from "@/utils/assignWorldWeighted";
import categoriseDomains from "@/utils/categoriseDomains";
import { useLocalState } from "@/hooks/useLocalState";

export default function Home() {
  const [world,  setWorld]  = useLocalState("echoes_world",  null);
  const [traits]           = useLocalState("echoes_traits", []);
  const router              = useRouter();

  // ⬇️  redirect if user already has a world + traits
  useEffect(() => {
    if (world && traits.length) router.replace("/guide");
  }, []);

  return (
    <main className={world ? world.theme : "theme-base"}>
      {!world && (
        <TraitForm
          onSubmit={(t) => {
            const w = assignWorldWeighted(t);
            const d = categoriseDomains(t);
            localStorage.setItem("echoes_traits",  JSON.stringify(t));
            localStorage.setItem("echoes_domain",  JSON.stringify(d));
            localStorage.setItem("echoes_world",   JSON.stringify(w));
            setWorld(w);
            router.push("/guide");            // first-time jump
          }}
        />
      )}
      <WorldReveal world={world} />
    </main>
  );
}
