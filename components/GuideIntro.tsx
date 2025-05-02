"use client";

import { useEffect, useState } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";

interface Props {
  domain: string;
  onPick(s: string): void;
}

export default function GuideIntro({ domain, onPick }: Props) {
  const [scenarios, setScenarios] = useState<string[] | null>(null);
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
        setScenarios(data.options || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [domain]);

  if (loading || !scenarios) {
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
        Select a scenario where your domain can shine:
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scenarios.map((s, i) => (
          <li key={i}>
            <button
              onClick={() => onPick(s)}
              className="btn-outline w-full text-left p-4"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
