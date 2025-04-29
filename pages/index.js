// pages/index.js
"use client";

import { useState, useEffect } from "react";
import { useRouter }        from "next/router";

import TraitForm    from "@/components/TraitForm";
import WorldReveal  from "@/components/WorldReveal";
import assignWorldWeighted from "@/utils/assignWorldWeighted";
import { useLocalState }   from "@/hooks/useLocalState";

import "@/styles/themes.css";   // global world-theme tints

export default function Home() {
  // persistent local values
  const [savedWorld,  setSavedWorld]  = useLocalState("echoes_world",  null);
  const [savedTraits, setSavedTraits] = useLocalState("echoes_traits", []);

  // live state
  const [world,  setWorld]  = useState(savedWorld);
  const router = useRouter();

  // keep any new world in localStorage
  useEffect(() => {
    if (world) setSavedWorld(world);
  }, [world]);

  return (
    <main className={world ? world.theme : "theme-base"}>
      {/* ─── Trait entry (only if no world chosen yet) ─────────────────── */}
      {!world && (
        <TraitForm
          onSubmit={(traits) => {
            const w = assignWorldWeighted(traits);
            setSavedTraits(traits);   // store traits
            setWorld(w);              // store world
            router.push("/guide");    // 🚀 jump to Guide screen
          }}
        />
      )}

      {/* ─── World reveal (if world already chosen) ───────────────────── */}
      {world && <WorldReveal world={world} />}
    </main>
  );
}
