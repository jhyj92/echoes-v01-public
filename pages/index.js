"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TraitForm from "@/components/TraitForm";
import WorldReveal from "@/components/WorldReveal";
import assignWorldWeighted from "@/utils/assignWorldWeighted";
import { useLocalState } from "@/hooks/useLocalState";

export default function Home() {
  // local persistence
  const [savedWorld, setSavedWorld] = useLocalState("echoes_world", null);
  const [world, setWorld]         = useState(savedWorld);

  const [traits, setTraits] = useLocalState("echoes_traits", []);
  const router              = useRouter();

  // sync world → localStorage
  useEffect(() => {
    if (world) setSavedWorld(world);
  }, [world]);

  // returning user: jump straight to guide
  useEffect(() => {
    if (world && traits.length > 0) router.replace("/guide");
  }, []);

  return (
    <main className={world ? world.theme : "theme-base"}>
      {!world && (
        <TraitForm
          onSubmit={(inputTraits) => {
            const w = assignWorldWeighted(inputTraits);
            setWorld(w);
            setTraits(inputTraits);
            router.push("/guide");        // 🚀 redirect after world chosen
          }}
        />
      )}
      <WorldReveal world={world} />
    </main>
  );
}
