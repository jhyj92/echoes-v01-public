"use client";

import React, { useState } from "react";

export interface DomainSelectorProps {
  domains: string[];
  onSelect: (domain: string) => void;
}

export default function DomainSelector({ domains, onSelect }: DomainSelectorProps) {
  const [selected, setSelected] = useState<number | null>(null);

  if (!domains.length) {
    return (
      <p className="text-gold italic mt-4">No domains available at the moment…</p>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {domains.map((domain, i) => (
          <button
            key={domain}
            type="button"
            onClick={() => setSelected(i)}
            className={`border rounded px-6 py-3 text-gold transition
              ${selected === i
                ? "border-gold bg-gold/10 ring-2 ring-gold"
                : "border-gold/40 hover:bg-gold hover:text-black focus:ring-2 focus:ring-gold"
              }`}
            aria-pressed={selected === i}
            aria-label={`Select domain ${domain}`}
          >
            {domain}
          </button>
        ))}
      </div>
      <button
        className="btn-primary w-full py-3 mt-6"
        disabled={selected === null}
        onClick={() => {
          if (selected !== null) onSelect(domains[selected]);
        }}
        aria-disabled={selected === null}
      >
        Continue
      </button>
    </div>
  );
}
