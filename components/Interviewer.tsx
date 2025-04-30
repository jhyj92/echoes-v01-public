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
  const [idx, setIdx]             = useState(0);
  const [loading, setLoading]     = useState(true);
  const [overlay, setOverlay]     = useState(false);

  // whenever `idx` changes, fetch the next question
  useEffect(() => {
    (async () => {
      setLoading(true);
      const timer = setTimeout(() => setOverlay(true), 1000);
      const prompt =
        idx === 0
          ? "Each human you speak to has a single, specific superpower... Ask question 1 of 10."
          : `My previous answer: "${answers[idx - 1]}". Ask question #${idx + 1}.`;

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
        const { question } = await res.json();
        setQuestions((q) => {
          const copy = [...q];
          copy[idx] = question;
          return copy;
        });
      } catch {
        setQuestions((q) => {
          const copy = [...q];
          copy[idx] = "The echoes falter. Try again…";
          return copy;
        });
      } finally {
        clearTimeout(timer);
        setOverlay(false);
        setLoading(false);
      }
    })();
  }, [idx, answers]);

  function submitAnswer(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const nextAnswers = [...answers, trimmed];
    setAnswers(nextAnswers);

    // global hue rotate
    document.body.style.setProperty(
      "--hue-shift",
      `${(nextAnswers.length / 10) * 360}deg`
    );

    if (nextAnswers.length === 10) {
      onComplete(nextAnswers);
    } else {
      setIdx(nextAnswers.length);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      {overlay && <LatencyOverlay />}
      <Bridge text={`Question ${idx + 1} of 10`} delay={0.2} />

      {loading ? (
        <p className="mt-8 text-center italic">Listening…</p>
      ) : (
        <>
          <p className="mt-6 mb-6 text-lg italic">{questions[idx]}</p>
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
