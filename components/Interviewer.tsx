"use client";

import { useEffect, useState } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import Bridge from "@/components/Bridge";
import LatencyOverlay from "@/components/LatencyOverlay";

export default function Interviewer({ onComplete }: { onComplete: (a: string[]) => void }) {
  const [q, setQ] = useState<string[]>([]);
  const [a, setA] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [overlay, setOverlay] = useState(false);

  useEffect(() => { ask(); }, []);

  async function ask() {
    setLoading(true);
    const timer = setTimeout(() => setOverlay(true), 1000);
    const prompt =
      idx === 0
        ? "Each human you speak to has a single, specific superpower... Ask question 1 of 10."
        : `My previous answer: "${a[idx - 1]}". Ask question #${idx + 1}.`;

    try {
      const res = await fetchWithTimeout("/api/interviewer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      }, 10000);
      const { question } = await res.json();
      setQ((prev) => [...prev, question]);
    } catch {
      setQ((prev) => [...prev, "The echoes falter. Try again…"]);
    } finally {
      clearTimeout(timer);
      setOverlay(false);
      setLoading(false);
    }
  }

  function submit(ans: string) {
    if (!ans.trim()) return;
    const next = [...a, ans.trim()];
    setA(next);

    /* global hue rotate */
    document.body.style.setProperty("--hue-shift", `${(next.length / 10) * 360}deg`);

    if (next.length === 10) {
      onComplete(next);
    } else {
      setIdx(next.length);
      ask();
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      {overlay && <LatencyOverlay />}
      <Bridge text={`Question ${idx + 1} of 10`} />
      {loading ? (
        <p className="mt-8 text-center italic">Listening…</p>
      ) : (
        <>
          <p className="mt-6 mb-6 text-lg italic">{q[idx]}</p>
          <input
            autoFocus
            type="text"
            className="w-full rounded border border-gold bg-transparent px-4 py-3 text-gold placeholder:text-gold/50 focus:outline-none"
            placeholder="Type your answer and press Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                submit(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
        </>
      )}
    </div>
  );
}
