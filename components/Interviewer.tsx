"use client";

import { useEffect, useState, FormEvent } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";

interface Props {
  onComplete(answers: string[]): void;
}

export default function Interviewer({ onComplete }: Props) {
  const [qIdx, setQIdx] = useState(0);
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ask first question on mount and when qIdx changes
  useEffect(() => {
    askNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx]);

  /* ---- Helpers --------------------------------------------------------- */
  const hueShift = () => {
    const curr = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--hue-shift") || "0",
      10
    );
    document.documentElement.style.setProperty("--hue-shift", `${(curr + 20) % 360}deg`);
  };

  const stripMeta = (raw: string) =>
    raw
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\([^)]*?\)$/g, "")
      .replace(/\*/g, "")
      .trim();

  /* ---- Fetch Next Question --------------------------------------------- */
  async function askNext() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithTimeout("/api/interviewer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idx: qIdx, answers }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setQuestion(stripMeta(data.question || ""));
    } catch (err) {
      console.error("Failed to fetch question:", err);
      setError("Failed to load question. Please try again.");
      setQuestion("…");
    } finally {
      setLoading(false);
    }
  }

  /* ---- Handle Submission ---------------------------------------------- */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!answer.trim() || loading) return;

    const updated = [...answers, answer.trim()];
    setAnswers(updated);
    setAnswer("");
    hueShift();

    if (qIdx === 9) {
      localStorage.setItem("echoes_answers", JSON.stringify(updated));
      onComplete(updated);
    } else {
      setQIdx(qIdx + 1);
    }
  };

  /* ---- Render ---------------------------------------------------------- */
  if (question === null) return null;

  return (
    <section className="w-full max-w-3xl space-y-6 text-gold">
      {loading && <LatencyOverlay />}
      {error && (
        <p className="text-red-500 italic mb-2" role="alert">
          {error}
        </p>
      )}

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
          disabled={loading}
          aria-label={`Answer to question ${qIdx + 1}`}
        />
      </form>
    </section>
  );
}
