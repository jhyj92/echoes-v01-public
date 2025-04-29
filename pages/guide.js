// pages/guide.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import assignGuide from "@/utils/assignGuide";
import { scripts } from "@/utils/conversationScript";
import { addCodex } from "@/utils/codexManager";

export default function GuidePage() {
  const router = useRouter();
  const [guide, setGuide] = useState(null);
  const [stage, setStage] = useState("intro");
  const [aiLine, setAI]   = useState("");

  useEffect(() => {
    const traits = JSON.parse(localStorage.getItem("echoes_traits") || "[]");
    if (!traits.length) {
      router.replace("/");
      return;
    }
    setGuide(assignGuide(traits));
  }, []);

  async function triggerAIReflect() {
    const traits = JSON.parse(localStorage.getItem("echoes_traits") || "[]").join(", ");
    const prompt = `User dominant traits: ${traits}. Write one poetic line.`;
    try {
      const res = await fetch("/api/extractTraits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: prompt })
      });
      const { traits: line } = await res.json();
      setAI(line);
      addCodex({ content: line });
      setStage("ai");
    } catch {
      setAI("The echoes are quiet right now. Try again later.");
      setStage("ai");
    }
  }

  if (!guide) return null;
  const script = scripts[guide.id] || scripts.dreamweaver;

  return (
    <main style={{ maxWidth: "640px", margin: "10vh auto" }} className="fade">
      <h1>{guide.name}</h1>

      {stage === "intro" && <p>{script.intro[0]}</p>}
      {stage === "intro" && (
        <button className="button-poetic" onClick={() => setStage("choices")}>Respond</button>
      )}

      {stage === "choices" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
          {script.choices.map((c, i) => (
            <button key={i} className="button-poetic" onClick={() => setStage("follow")}>
              {c}
            </button>
          ))}
        </div>
      )}

      {stage === "follow" && (
        <>
          <p style={{ marginTop: "24px" }}>{script.followup[0]}</p>
          <button className="button-poetic" onClick={triggerAIReflect}>Continue</button>
        </>
      )}

      {stage === "ai" && (
        <>
          <p style={{ marginTop: "24px" }}>{aiLine}</p>
          <p style={{ marginTop: "24px" }}>
            What word lingers in your heart, even when silence surrounds you?
          </p>
          <input
            style={{
              width: "100%",
              padding: "10px",
              background: "#0F1116",
              color: "#fff",
              border: "1px solid #444"
            }}
          />
        </>
      )}
    </main>
);
}
