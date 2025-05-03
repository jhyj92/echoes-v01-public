"use client";

import { useEffect, useState } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";

export interface GuideIntroProps {
  domain: string;
  onSelect: (scenario: string) => void;
}

export default function GuideIntro({ domain, onSelect }: GuideIntroProps) {
  const [question, setQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!domain) return;

    setLoading(true);
    fetchWithTimeout("/api/guideIntro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
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
  }, [domain]);

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
        Your Reflection Prompt
      </h2>
      <div className="mb-6 border-l-4 border-gold/40 pl-4 text-lg italic">
        {question}
      </div>
      <button
        onClick={() => onSelect(question)}
        className="btn-primary w-full py-3"
      >
        Begin
      </button>
    </section>
  );
}
