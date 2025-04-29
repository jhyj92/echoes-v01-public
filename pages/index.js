// pages/index.js
"use client";

import { useState, useEffect } from 'react';
import TraitForm from '@/components/TraitForm';
import WorldReveal from '@/components/WorldReveal';
import assignWorldWeighted from '@/utils/assignWorldWeighted';
import { useLocalState } from '@/hooks/useLocalState';
import '@/styles/themes.css';

export default function Home() {
  const [savedWorld, setSavedWorld] = useLocalState('echoes_world', null);
  const [world, setWorld] = useState(savedWorld);

  useEffect(() => {
    if (world) setSavedWorld(world);
  }, [world]);

  return (
    <main className={world ? world.theme : 'theme-base'}>
      {!world && (
        <TraitForm
          onSubmit={traits => {
            const w = assignWorldWeighted(traits);
            setWorld(w);
          }}
        />
      )}

      <WorldReveal world={world} />
    </main>
  );
}
