"use client";

import { useEffect, useState } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";

export interface GuideIntroProps {
  domain: string;
  onSelect: (scenario: string) => void;
}

export default function GuideIntro({ domain, onSelect }: GuideIntroProps) {
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
        setScenarios(data.options ?? []);
      })
      .catch(() => {
        setScenarios([]);
      })
      .finally(() => {
        setLoading(false);
      });
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
        {scenarios.map((scenario, index) => (
          <li key={index}>
            <button
              onClick={() => onSelect(scenario)}
              className="btn-outline w-full text-left p-4"
            >
              {scenario}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
