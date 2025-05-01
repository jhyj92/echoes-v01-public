// components/DomainSelector.tsx
import React from "react";

interface DomainSelectorProps {
  domains: string[];
  onSelect: (domain: string) => void;
}

export default function DomainSelector({
  domains,
  onSelect,
}: DomainSelectorProps) {
  if (!domains || domains.length === 0) {
    return <p className="text-lg italic">Loading domains…</p>;
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {domains.map((d) => (
        <button
          key={d}
          onClick={() => onSelect(d)}
          className="btn-outline hover:bg-gold/10 min-h-[56px] w-full"
        >
          {d}
        </button>
      ))}
    </div>
  );
}
