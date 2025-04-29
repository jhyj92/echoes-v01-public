"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import TraitForm from "@/components/TraitForm";
import WorldReveal from "@/components/WorldReveal";
import assignWorldWeighted from "@/utils/assignWorldWeighted";
import categoriseDomains from "@/utils/categoriseDomains";
import { useLocalState } from "@/hooks/useLocalState";

export default function Home() {
  const [world,  setWorld]  = useLocalState("echoes_world", null);
  const router              = useRouter();

  return (
    <main className={world ? world.theme : "theme-base"}>
      {!world && (
        <TraitForm
          onSubmit={(traits) => {
            const assignedWorld = assignWorldWeighted(traits);
            const domain        = categoriseDomains(traits);

            localStorage.setItem("echoes_traits",  JSON.stringify(traits));
            localStorage.setItem("echoes_domain",  JSON.stringify(domain));
            localStorage.setItem("echoes_world",   JSON.stringify(assignedWorld));

            setWorld(assignedWorld);
            router.push("/guide");
          }}
        />
      )}
      <WorldReveal world={world} />
    </main>
  );
}
