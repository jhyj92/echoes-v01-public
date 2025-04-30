// pages/guide.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import assignGuide from "@/utils/assignGuide";
import { scripts } from "@/utils/conversationScript";
import { addCodex } from "@/utils/codexManager";

export default function GuidePage() {
  const router = useRouter();
  const STAGES = ["intro", "choices", "follow", "ai", "prompt", "complete"];
  const [stage, setStage] = useState("complete"); // for Phase 8 view

  const [guide, setGuide] = useState(null);

  useEffect(() => {
    const traits = JSON.parse(localStorage.getItem("echoes_traits") || "[]");
    if (!traits.length) {
      router.replace("/");
      return;
    }
    setGuide(assignGuide(traits));
  }, []);

  if (!guide) return null;

  return (
    <main style={{ maxWidth: "640px", margin: "10vh auto", textAlign: "center" }}>
      <h1>{guide.name}</h1>

      {/* … previous stages omitted for brevity … */}

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
