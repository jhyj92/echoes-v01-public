/* ----------------------------------------------------------------
   Interviewer ▸ asks 10 AI questions, rotates hue, strips meta text
-----------------------------------------------------------------*/
"use client";

import { useEffect, useState } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";

interface Props {
  onComplete(answers: string[]): void;
}

export default function Interviewer({ onComplete }: Props) {
  const [qIdx, setQIdx]           = useState(0);
  const [question, setQuestion]   = useState<string | null>(null);
  const [answer, setAnswer]       = useState("");
  const [answers, setAnswers]     = useState<string[]>([]);
  const [loading, setLoading]     = useState(true);

  // --- ask first question on mount
  useEffect(() => { askNext(); }, []);

  /* ---- helpers --------------------------------------------------------- */
  const hueShift = () => {
    const curr = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--hue-shift") || "0",
      10,
    );
    document.documentElement.style
      .setProperty("--hue-shift", `${(curr + 20) % 360}deg`);
  };

  const stripMeta = (raw: string) =>
    raw.replace(/\*\*(.*?)\*\*/g, "$1")                 // remove bold markdown
       .replace(/\([^)]*?\)$/g, "")                     // strip trailing (...) meta
       .replace(/\*/g, "")                              // stray asterisks
       .trim();

  async function askNext() {
    setLoading(true);
    const res  = await fetchWithTimeout("/api/interviewer", { method: "POST", body: JSON.stringify({ idx: qIdx, answers })});
    const data = await res.json();
    setQuestion(stripMeta(data.question));
    setLoading(false);
  }

  /* ---- submit answer --------------------------------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    const updated = [...answers, answer.trim()];
    setAnswers(updated);
    setAnswer("");
    hueShift();

    if (qIdx === 9) {
      onComplete(updated);
    } else {
      setQIdx(qIdx + 1);
      askNext();
    }
  };

  /* ---- render ---------------------------------------------------------- */
  if (!question) return null;

  return (
    <section className="w-full max-w-3xl space-y-6">
      {loading && <p className="italic text-sm">The echoes are thinking…</p>}

      <div dangerouslySetInnerHTML={{ __html: `<strong>Question ${qIdx + 1} of 10</strong><br/>${question}` }} />

      <form onSubmit={handleSubmit}>
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer and press ↵"
          className="w-full rounded bg-transparent border border-gold/40 px-3 py-2 focus:outline-none"
          autoFocus
        />
      </form>
    </section>
  );
}
