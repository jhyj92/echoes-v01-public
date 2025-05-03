// components/ReflectionLetter.tsx
"use client";

import React from "react";

interface Props {
  letter: string;
  onContinue: () => void;
}

export default function ReflectionLetter({ letter, onContinue }: Props) {
  return (
    <div className="max-w-xl p-6 space-y-6 text-lg bg-black bg-opacity-80 text-gold border border-gold rounded-lg">
      <p>{letter}</p>
      <button
        onClick={onContinue}
        className="mt-6 px-4 py-2 border border-gold text-gold hover:bg-gold hover:text-black transition"
      >
        Continue
      </button>
    </div>
  );
}
