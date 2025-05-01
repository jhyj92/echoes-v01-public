// components/ReflectionLetter.tsx
"use client";

import React from "react";

interface ReflectionLetterProps {
  letter: string;
  onContinue: () => void;
}

export default function ReflectionLetter({
  letter,
  onContinue,
}: ReflectionLetterProps) {
  return (
    <div className="p-8 max-w-xl mx-auto prose prose-invert">
      <h2>Letter from the Hero</h2>
      <p>{letter}</p>
      <button
        className="btn-primary mt-6"
        onClick={onContinue}
      >
        Continue Your Journey
      </button>
    </div>
  );
}
