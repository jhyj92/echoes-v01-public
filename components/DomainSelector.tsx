"use client";

import React from "react";

export interface DomainSelectorProps {
  domains: string[];
  onSelect: (domain: string) => void;
}

export default function DomainSelector({ domains, onSelect }: DomainSelectorProps) {
  if (!domains.length) {
    return (
      <p className="text-gold italic mt-4">No domains available at the moment…</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
      {domains.map((domain) => (
        <button
          key={domain}
          type="button"
          onClick={() => onSelect(domain)}
          className="border border-gold rounded px-6 py-3 text-gold hover:bg-gold hover:text-black focus:ring-2 focus:ring-gold transition"
          aria-label={`Select domain ${domain}`}
        >
          {domain}
        </button>
      ))}
    </div>
  );
}
