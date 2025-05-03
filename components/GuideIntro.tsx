"use client";

import { useEffect, useState } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";

export interface GuideIntroProps {
  domain: string;
  onSelect: (reflections: string[]) => void;
}

export default function GuideIntro({ domain, onSelect }: GuideIntroProps) {
  const [idx, setIdx] = useState(0);
  const [question, setQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!domain) return;

    setLoading(true);
    fetchWithTimeout("/api/guideIntro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, idx, reflections: answers }),
    })
      .then((res) => res.json())
      .then((data) => {
        setQuestion(data.question ?? "");
      })
      .catch(() => {
        setQuestion("The echoes are silent… Try again soon.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [domain, idx, answers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const updatedAnswers = [...answers, input.trim()];
    setAnswers(updatedAnswers);
    setInput("");

    if (idx === 9) {
      // Completed 10 questions
      onSelect(updatedAnswers);
    } else {
      setIdx(idx + 1);
    }
  };

  if (loading || !question) {
    return (
      <div className="flex flex-col items-center">
        <LatencyOverlay />
        <p className="italic mt-4">The echoes are guiding you…</p>
      </div>
    );
  }

  return (
    <section className="w-full max-w-xl space-y-6 text-gold">
      <h2 className="text-2xl font-serif mb-4">
        Reflection {idx + 1} of 10
      </h2>
      <div className="mb-6 border-l-4 border-gold/40 pl-4 text-lg italic">
        {question}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your reflection here..."
          className="w-full rounded bg-transparent border border-gold/40 px-3 py-2 focus:outline-none"
          autoFocus
          aria-label="Your reflection"
        />
        <button type="submit" className="btn-primary w-full py-3 mt-4">
          {idx === 9 ? "Finish" : "Next"}
        </button>
      </form>
    </section>
  );
}
