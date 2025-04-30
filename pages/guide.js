// File: pages/guide.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import assignGuide from "@/utils/assignGuide";
import { scripts } from "@/utils/conversationScript";
import { addCodex } from "@/utils/codexManager";
import useHydratedState from "@/hooks/useHydratedState";
import { saveSession, loadSession } from "@/utils/sessionManager";
import FadeIn from "@/components/FadeIn";

export default function GuidePage() {
  const router = useRouter();
  const STAGES = ["intro", "choices", "follow", "ai", "prompt", "complete"];

  const traits    = useHydratedState("echoes_traits", []);
  const savedStage= loadSession("stage", "intro");
  const savedAI   = loadSession("aiLine", "");
  const savedWord = loadSession("userWord", "");

  const [stage, setStage]       = useState(savedStage);
  const [aiLine, setAI]         = useState(savedAI);
  const [userWord, setUserWord] = useState(savedWord);
  const [guide, setGuide]       = useState(null);

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
    const prompt = `User traits: ${traits.join(", ")}. Write one poetic line reflecting their essence.`;
    try {
      const res = await fetch("/api/extractTraits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: prompt })
      });
      const { traits: line } = await res.json();
      setAI(line);
      saveSession("aiLine", line);
      addCodex({ content: line });
    } catch {
      const fallback = "The echoes are quiet right now. Try again later.";
      setAI(fallback);
      saveSession("aiLine", fallback);
      addCodex({ content: fallback });
    }
    goTo("ai");
  }

  function submitUserWord() {
    if (!userWord.trim()) return;
    addCodex({ content: userWord.trim() });
    saveSession("userWord", userWord.trim());
    goTo("complete");
  }

  return (
    <main style={{ maxWidth: "640px", margin: "10vh auto", textAlign: "center" }}>
      <FadeIn delay={0}>
        <h1>{guide.name}</h1>
      </FadeIn>

      {stage === "intro" && (
        <>
          <FadeIn delay={0.5}><p>{script.intro[0]}</p></FadeIn>
          <FadeIn delay={1}><button className="button-poetic" onClick={() => goTo("choices")}>Respond</button></FadeIn>
        </>
      )}

      {stage === "choices" && (
        <FadeIn delay={0.5}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
            {script.choices.map((choice, idx) => (
              <button key={idx} className="button-poetic" onClick={() => goTo("follow")}>{choice}</button>
            ))}
          </div>
        </FadeIn>
      )}

      {stage === "follow" && (
        <>
          <FadeIn delay={0.5}><p style={{ marginTop: "24px" }}>{script.followup[0]}</p></FadeIn>
          <FadeIn delay={1}><button className="button-poetic" onClick={triggerAIReflect}>Continue</button></FadeIn>
        </>
      )}

      {stage === "ai" && (
        <>
          <FadeIn delay={0.5}><p style={{ marginTop: "24px" }}>{aiLine}</p></FadeIn>
          <FadeIn delay={1}>
            <p style={{ marginTop: "24px" }}>What word lingers in your heart, even when silence surrounds you?</p>
            <input
              type="text"
              value={userWord}
              onChange={(e) => setUserWord(e.target.value)}
              placeholder="Your word here…"
              style={{ width: "100%", padding: "10px", marginTop: "12px", background: "#0F1116", color: "#fff", border: "1px solid #444" }}
              onKeyDown={(e) => e.key === "Enter" && submitUserWord()}
            />
            <button className="button-poetic" style={{ marginTop: "16px" }} onClick={submitUserWord}>Share</button>
          </FadeIn>
        </>
      )}

      {stage === "complete" && (
        <FadeIn delay={0.5}>
          <p style={{ marginTop: "24px" }}>Thank you. Your echo has been recorded in your Codex.</p>
          <FadeIn delay={1}>
            <button className="button-poetic" onClick={() => router.push("/codex")}>View My Codex</button>
          </FadeIn>
        </FadeIn>
      )}
    </main>
  );
}
