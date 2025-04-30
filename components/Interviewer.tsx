// components/Interviewer.tsx
"use client";

import { useEffect, useState } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import Bridge from "@/components/Bridge";
import LatencyOverlay from "@/components/LatencyOverlay";

interface Props {
  onComplete: (answers: string[]) => void;
}

export default function Interviewer({ onComplete }: Props) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers]     = useState<string[]>([]);
  const [current, setCurrent]     = useState(0);
  const [loading, setLoading]     = useState(true);
  const [overlay, setOverlay]     = useState(false);

  // get the first question on mount
  useEffect(() => {
    askQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function askQuestion() {
    setLoading(true);
    const overlayTimer = setTimeout(() => setOverlay(true), 1000);

    const prompt =
      current === 0
        ? "Each human you speak to has a single, specific superpower... Ask question 1 of 10."
        : `My previous answer: "${answers[current - 1]}". Ask question #${current + 1} (total 10).`;

    try {
      const res = await fetchWithTimeout(
        "/api/interviewer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        },
        10000
      );
      if (!res.ok) throw new Error("Interview API failed");
      const { question } = await res.json();
      setQuestions((qs) => [...qs, question]);
    } catch (e) {
      console.error(e);
      setQuestions((qs) => [...qs, "The echoes falter. Try again…"]);
    } finally {
      clearTimeout(overlayTimer);
      setOverlay(false);
      setLoading(false);
    }
  }

  function submitAnswer(ans: string) {
    if (!ans.trim()) return;
    const next = [...answers, ans.trim()];
    setAnswers(next);

    /* -------------- hue-rotate the whole UI (Step 6) -------------- */
    document.body.style.setProperty(
      "--hue-shift",
      `${(next.length / 10) * 360}deg`
    );
    /* -------------------------------------------------------------- */

    if (next.length >= 10) {
      onComplete(next);
    } else {
      setCurrent(next.length);
      askQuestion();
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      {overlay && <LatencyOverlay text="The echoes are thinking…" />}

      <Bridge text={`Question ${current + 1} of 10`} />

      {loading ? (
        <p className="mt-8 text-center italic">Listening…</p>
      ) : (
        <>
          <p className="mt-6 mb-6 text-lg italic">{questions[current]}</p>
          <input
            autoFocus
            type="text"
            className="w-full rounded border border-gold bg-transparent px-4 py-3 text-gold placeholder:text-gold/50 focus:outline-none"
            placeholder="Type your answer and press Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                submitAnswer(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
        </>
      )}
    </div>
  );
}
