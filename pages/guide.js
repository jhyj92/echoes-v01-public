// pages/guide.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import useHydratedState from "@/hooks/useHydratedState";
import assignGuide from "@/utils/assignGuide";
import { scripts } from "@/utils/conversationScript";
import { addCodex } from "@/utils/codexManager";
import { saveSession, loadSession } from "@/utils/sessionManager";
import FadeIn from "@/components/FadeIn";

export default function GuidePage() {
  const router = useRouter();
  const STAGES = ["intro", "choices", "follow", "ai", "prompt", "complete"];

  // Hydrate persisted state
  const traits    = useHydratedState("echoes_traits", []);
  const savedStage= loadSession("stage", "intro");
  const savedAI   = loadSession("aiLine", "");
  const savedWord = loadSession("userWord", "");

  const [stage, setStage]       = useState(savedStage);
  const [aiLine, setAI]         = useState(savedAI);
  const [userWord, setUserWord] = useState(savedWord);
  const [guide, setGuide]       = useState(null);

  // Assign guide
  useEffect(() => {
    if (!traits.length) {
      router.replace("/");
      return;
    }
    setGuide(assignGuide(traits));
  }, [traits, router]);

  if (!guide) return null;
  const script = scripts[guide.id] || scripts.dreamweaver;

  function goTo(next) {
    setStage(next);
    saveSession("stage", next);
  }

  async function triggerAIReflect() {
    // unchanged
    goTo("ai");
  }

  function submitUserWord() {
    // unchanged
    goTo("complete");
  }

  return (
    <main style={{ maxWidth: "640px", margin: "10vh auto", textAlign: "center" }}>
      <FadeIn delay={0}>
        <h1>{guide.name}</h1>
      </FadeIn>
      {/* All stages wrapped in FadeIn as before */}
    </main>
  );
}
