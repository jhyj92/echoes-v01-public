// pages/guide.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import assignGuide from "@/utils/assignGuide";
import { scripts } from "@/utils/conversationScript";
import { addCodex } from "@/utils/codexManager";
import FadeIn from "@/components/FadeIn";

export default function GuidePage() {
  const router = useRouter();
  const STAGES = ["intro", "choices", "follow", "ai", "prompt", "complete"];
  const [stage, setStage] = useState(STAGES[0]);
  const [guide, setGuide] = useState(null);
  const [aiLine, setAI]   = useState("");
  const [userWord, setUserWord] = useState("");

  // assign guide on mount
  useEffect(() => {
    const traits = JSON.parse(localStorage.getItem("echoes_traits") || "[]");
    if (!traits.length) {
      router.replace("/");
      return;
    }
    setGuide(assignGuide(traits));
  }, []);

  if (!guide) return null;
  const script = scripts[guide.id] || scripts.dreamweaver;

  // AI reflection
  async function triggerAIReflect() {
    const traits = JSON.parse(localStorage.getItem("echoes_traits") || "[]").join(", ");
    const prompt = `User traits: ${traits}. Write one poetic line reflecting their essence.`;
    try {
      const res = await fetch("/api/extractTraits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: prompt })
      });
      const { traits: line } = await res.json();
      setAI(line);
      addCodex({ content: line });
    } catch {
      const fallback = "The echoes are quiet right now. Try again later.";
      setAI(fallback);
      addCodex({ content: fallback });
    }
    setStage("ai");
  }

  // submit user’s final word
  function submitUserWord() {
    if (!userWord.trim()) return;
    addCodex({ content: userWord.trim() });
    setStage("complete");
  }

  return (
    <main style={{ maxWidth: "640px", margin: "10vh auto", textAlign: "center" }}>
      <FadeIn delay={0}>
        <h1>{guide.name}</h1>
      </FadeIn>

      {stage === "intro" && (
        <>
          <FadeIn delay={0.5}>
            <p>{script.intro[0]}</p>
          </FadeIn>
          <FadeIn delay={1}>
            <button className="button-poetic" onClick={() => setStage("choices")}>
              Respond
            </button>
          </FadeIn>
        </>
      )}

      {stage === "choices" && (
        <FadeIn delay={0.5}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
            {script.choices.map((choice, idx) => (
              <button
                key={idx}
                className="button-poetic"
                onClick={() => setStage("follow")}
              >
                {choice}
              </button>
            ))}
          </div>
        </FadeIn>
      )}

      {stage === "follow" && (
        <>
          <FadeIn delay={0.5}>
            <p style={{ marginTop: "24px" }}>{script.followup[0]}</p>
          </FadeIn>
          <FadeIn delay={1}>
            <button className="button-poetic" onClick={triggerAIReflect}>
              Continue
            </button>
          </FadeIn>
        </>
      )}

      {stage === "ai" && (
        <>
          <FadeIn delay={0.5}>
            <p style={{ marginTop: "24px" }}>{aiLine}</p>
          </FadeIn>
          <FadeIn delay={1}>
            <p style={{ marginTop: "24px" }}>
              What word lingers in your heart, even when silence surrounds you?
            </p>
            <input
              type="text"
              value={userWord}
              onChange={(e) => setUserWord(e.target.value)}
              placeholder="Your word here…"
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "12px",
                background: "#0F1116",
                color: "#fff",
                border: "1px solid #444"
              }}
              onKeyDown={(e) => e.key === "Enter" && submitUserWord()}
            />
            <button
              className="button-poetic"
              style={{ marginTop: "16px" }}
              onClick={submitUserWord}
            >
              Share
            </button>
          </FadeIn>
        </>
      )}

      {stage === "complete" && (
        <FadeIn delay={0.5}>
          <p style={{ marginTop: "24px" }}>
            Thank you. Your echo has been recorded in your Codex.
          </p>
          <FadeIn delay={1}>
            <button className="button-poetic" onClick={() => router.push("/codex")}>
              View My Codex
            </button>
          </FadeIn>
        </FadeIn>
      )}
    </main>
  );
}
