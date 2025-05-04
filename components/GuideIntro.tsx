"use client";
import { useEffect, useState, FormEvent } from "react";
import LatencyOverlay from "@/components/LatencyOverlay";

interface GuideIntroProps {
  domain: string;
  onComplete: (answers: string[]) => void;
  initialAnswers?: string[];
}

export default function GuideIntro({ domain, onComplete, initialAnswers = [] }: GuideIntroProps) {
  const [qIdx, setQIdx] = useState(initialAnswers.length);
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>(initialAnswers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch next reflection question
  useEffect(() => {
    if (qIdx >= 10) return;
    setLoading(true);
    setError(null);
    fetch("/api/guideIntro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idx: qIdx, domain, reflections: answers }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(data => setQuestion(data.question || "…"))
      .catch(() => setError("Failed to load reflection question."))
      .finally(() => setLoading(false));
  }, [qIdx, domain, answers]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || loading) return;
    const updated = [...answers, answer.trim()];
    setAnswers(updated);
    setAnswer("");
    if (qIdx === 9) {
      onComplete(updated);
    } else {
      setQIdx(qIdx + 1);
    }
  };

  if (qIdx >= 10) return null;
  if (question === null) return <LatencyOverlay />;

  return (
    <section className="w-full max-w-2xl space-y-6 text-gold" aria-live="polite">
      {loading && <LatencyOverlay />}
      {error && (
        <p className="text-red-500 italic mb-2" role="alert">
          {error}
        </p>
      )}
      <div>
        <strong>Reflection {qIdx + 1} of 10</strong>
        <br />
        {question}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Type your reflection and press ↵"
          className="w-full rounded bg-transparent border border-gold/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
          autoFocus
          disabled={loading}
          aria-label={`Reflection ${qIdx + 1}`}
        />
      </form>
    </section>
  );
}
