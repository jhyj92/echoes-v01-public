// pages/guide.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import assignGuide from "@/utils/assignGuide";
import { scripts } from "@/utils/conversationScript";
import { addCodex } from "@/utils/codexManager";
import { saveSession, loadSession } from "@/utils/sessionManager";

export default function GuidePage() {
  const router = useRouter();
  const STAGES = ["intro", "choices", "follow", "ai", "prompt", "complete"];

  // Load persisted state or start at intro
  const [stage, setStage]       = useState(loadSession("stage", "intro"));
  const [aiLine, setAI]         = useState(loadSession("aiLine", ""));
  const [userWord, setUserWord] = useState(loadSession("userWord", ""));

  const [guide, setGuide] = useState(null);

  // Assign guide once
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

  // Persist stage changes
  function goTo(next) {
    setStage(next);
    saveSession("stage", next);
  }

  // Trigger AI reflection with persistence
  async function triggerAIReflect() {
    const traits = JSON.parse(localStorage.getItem("echoes_traits") || "[]").join(", ");
    const prompt = `User dominant traits: ${traits}. Write one poetic line reflecting their essence.`;
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

  // Handle final user word with persistence
  function submitUserWord() {
    if (!userWord.trim()) return;
    addCodex({ content: userWord.trim() });
    saveSession("userWord", userWord.trim());
    goTo("complete");
  }

  return (
    <main style={{ maxWidth: "640px", margin: "10vh auto", textAlign: "center" }}>
      <h1>{guide.name}</h1>

      {stage === "intro" && (
        <>
          <p>{script.intro[0]}</p>
          <button className="button-poetic" onClick={() => goTo("choices")}>
            Respond
          </button>
        </>
      )}

      {stage === "choices" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
          {script.choices.map((choice, idx) => (
            <button
              key={idx}
              className="button-poetic"
              onClick={() => goTo("follow")}
            >
              {choice}
            </button>
          ))}
        </div>
      )}

      {stage === "follow" && (
        <>
          <p style={{ marginTop: "24px" }}>{script.followup[0]}</p>
          <button className="button-poetic" onClick={triggerAIReflect}>
            Continue
          </button>
        </>
      )}

      {stage === "ai" && (
        <>
          <p style={{ marginTop: "24px" }}>{aiLine}</p>
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
        </>
      )}

      {stage === "complete" && (
        <>
          <p style={{ marginTop: "24px" }}>
            Thank you. Your echo has been recorded in your Codex.
          </p>
          <button className="button-poetic" onClick={() => router.push("/codex")}>
            View My Codex
          </button>
        </>
      )}
    </main>
  );
}
