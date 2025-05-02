// components/Interviewer.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";

interface Props {
  onComplete(answers: string[]): void;
}

export default function Interviewer({ onComplete }: Props) {
  const [qIdx, setQIdx] = useState(0);
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Ask first question on mount
  useEffect(() => {
    askNext();
  }, []);

  /* ---- Helpers --------------------------------------------------------- */
  // Rotate the hue-shift CSS variable by 20deg each time
  const hueShift = () => {
    const curr = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--hue-shift") || "0",
      10
    );
    document.documentElement.style.setProperty(
      "--hue-shift",
      `${(curr + 20) % 360}deg`
    );
  };

  // Strip markdown/meta hints from raw AI output
  const stripMeta = (raw: string) =>
    raw
      .replace(/\*\*(.*?)\*\*/g, "$1") // remove **bold**
      .replace(/\([^)]*?\)$/g, "") // strip trailing parenthetical
      .replace(/\*/g, "") // stray asterisks
      .trim();

  /* ---- Fetch Next Question --------------------------------------------- */
  async function askNext() {
    setLoading(true);
    try {
      const res = await fetchWithTimeout("/api/interviewer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answersSoFar: answers }),
      });
      const data = await res.json();
      const rawQ = data.question || "";
      setQuestion(stripMeta(rawQ));
    } catch {
      setQuestion("…");
    } finally {
      setLoading(false);
    }
  }

  /* ---- Handle Submission ---------------------------------------------- */
  const handleSubmit = (e: FormEvent) => {
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

  /* ---- Render ---------------------------------------------------------- */
  if (question === null) return null;

  return (
    <section className="w-full max-w-3xl space-y-6 text-gold">
      {loading && <p className="italic text-sm">The echoes are thinking…</p>}

      <div
        dangerouslySetInnerHTML={{
          __html: `<strong>Question ${qIdx + 1} of 10</strong><br/>${question}`,
        }}
      />

      <form onSubmit={handleSubmit}>
        <input
          type="text"
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
