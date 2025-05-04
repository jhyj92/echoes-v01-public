"use client";
import { useState } from "react";

export interface HeroOption {
  hero: string;
  scenario: string;
}

export default function HeroSelector({
  options,
  onSelect,
}: {
  options: HeroOption[];
  onSelect: (hero: string, scenario: string) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="w-full max-w-xl space-y-6 text-gold">
      <h2 className="text-2xl font-serif mb-4">Choose your hero's call</h2>
      <ul className="space-y-4">
        {options.map((opt, i) => (
          <li
            key={i}
            tabIndex={0}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
            onKeyDown={e => (e.key === "Enter" || e.key === " ") && setSelected(i)}
            className={`border rounded p-4 cursor-pointer transition-colors duration-150 ${
              selected === i
                ? "border-gold bg-gold/10 ring-2 ring-gold"
                : "border-gold/40"
            }`}
          >
            <strong>{opt.hero}</strong>
            <div className="text-sm mt-1 italic">{opt.scenario}</div>
          </li>
        ))}
      </ul>
      <button
        className="btn-primary w-full py-3 mt-4"
        disabled={selected === null}
        onClick={() => {
          if (selected !== null) onSelect(options[selected].hero, options[selected].scenario);
        }}
        aria-disabled={selected === null}
      >
        Continue
      </button>
    </section>
  );
}
