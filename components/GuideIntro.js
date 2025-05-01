// components/GuideIntro.js
"use client";

import { useEffect, useState } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";
import Bridge from "@/components/Bridge";

export default function GuideIntro({ domain, onPick }) {
  const [intros, setIntros]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [overlay, setOverlay] = useState(false);

  useEffect(() => {
    generateIntros();
  }, []);

  async function generateIntros() {
    setLoading(true);
    const timer = setTimeout(() => setOverlay(true), 5000);
    try {
      const prompt = `Now that we've chosen domain "${domain}", provide 3 poetic narrative entry points.`;
      const res = await fetchWithTimeout(
        "/api/guideIntro",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain, prompt }),
        },
        10000
      );
      const { scenarios } = await res.json();
      setIntros(scenarios);
    } catch {
      setIntros([
        "A starlit path appears…",
        "A whisper draws you…",
        "A mirror ripples…"
      ]);
    } finally {
      clearTimeout(timer);
      setOverlay(false);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gold">Summoning your guide…</p>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 max-w-lg mx-auto space-y-6">
      {overlay && (
        <LatencyOverlay text="The echoes are weaving your story…" />
      )}
      <Bridge text="Choose your encounter" delay={0} />

      <ul className="space-y-4">
        {intros.map((s, i) => (
          <li key={i}>
            <button
              className="button-poetic w-full text-left px-4 py-3"
              onClick={() => onPick(s)}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
