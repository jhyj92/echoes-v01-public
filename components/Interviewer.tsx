"use client";

import { useEffect, useState, FormEvent } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";

interface Props {
  onComplete(answers: string[]): void;
}

const MAX_QUESTIONS = 10;
const STORAGE_KEY = "echoes_answers";

export default function Interviewer({ onComplete }: Props) {
  const [qIdx, setQIdx] = useState<number>(0);
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved answers and question index on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        setAnswers(parsed);
        setQIdx(parsed.length);
      } else {
        setQIdx(0);
      }
    } catch {
      setQIdx(0);
    }
  }, []);

  // Fetch next question whenever qIdx changes
  useEffect(() => {
    if (qIdx >= MAX_QUESTIONS) {
      setLoading(false);
      setQuestion(null);
      return;
    }
    askNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx]);

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!answer.trim() || loading) return;

    const updated = [...answers, answer.trim()];
    setAnswers(updated);
    setAnswer("");
    hueShift();

    // Save progress
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (qIdx + 1 >= MAX_QUESTIONS) {
      onComplete(updated);
    } else {
      setQIdx(qIdx + 1);
    }
  };

  const handleRestart = () => {
    setAnswers([]);
    setQIdx(0);
    setAnswer("");
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (question === null && !loading) {
    return (
      <section className="w-full max-w-3xl space-y-6 text-gold">
        <p>Interview complete! Thank you for sharing.</p>
        <button
          onClick={handleRestart}
          className="px-4 py-2 border border-gold rounded hover:bg-gold hover:text-black"
        >
          Restart Interview
        </button>
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl space-y-6 text-gold" aria-live="polite">
      {loading && <LatencyOverlay />}
      {error && (
        <p className="text-red-500 italic mb-2" role="alert">
          {error}{" "}
          <button onClick={askNext} className="underline">
            Retry
          </button>
        </p>
      )}

      <div
        dangerouslySetInnerHTML={{
          __html: `<strong>Question ${qIdx + 1} of ${MAX_QUESTIONS}</strong><br/>${question}`,
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
