// components/GuideIntro.tsx
"use client";

import { useEffect, useState } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";

interface Props {
  scenarios: string[];
  onSelect(s: string): void;
}

export default function GuideIntro({ scenarios, onSelect }: Props) {
  const [loading, setLoading] = useState(false);

  // If you later want to fetch intros here instead of pages/guide, you could:
  // useEffect(() => { ... }, []);

  if (loading) {
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
              onClick={() => onSelect(s)}
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
