// components/DomainSelector.tsx
"use client";

import { useEffect, useState } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";
import Bridge from "@/components/Bridge";

interface Props {
  answers: string[];
  onSelect: (domain: string) => void;
}

export default function DomainSelector({ answers, onSelect }: Props) {
  const [domains, setDomains]   = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const [overlay, setOverlay]   = useState(false);
  const [selected, setSelected] = useState("");

  /* ───────── fetch 5 domains once ───────── */
  useEffect(() => { fetchDomains(); }, []);

  async function fetchDomains() {
    setLoading(true);
    const timer = setTimeout(() => setOverlay(true), 5000);
    try {
      const res = await fetchWithTimeout("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      }, 10000);
      const { suggestions } = await res.json();
      setDomains(suggestions);
    } catch {
      setDomains(["Curiosity", "Courage", "Reflection", "Discovery", "Wonder"]);
    } finally {
      clearTimeout(timer);
      setOverlay(false);
      setLoading(false);
    }
  }

  /* ───────── UI ───────── */
  if (loading) return <p className="text-center mt-10">Loading domains…</p>;

  return (
    <div className="px-6 py-12">
      {overlay && <LatencyOverlay text="The echoes are pondering…" />}
      <Bridge text="Choose your domain" />

      <div className="grid gap-4 mt-6">
        {domains.map((d) => (
          <button
            key={d}
            onClick={() => {
              setSelected(d);          // visual feedback
              setTimeout(() => onSelect(d), 300); // short delay
            }}
            className={`btn-outline hover:bg-gold/10 min-h-[56px] ${
              selected === d ? "ring-2 ring-gold" : ""
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
