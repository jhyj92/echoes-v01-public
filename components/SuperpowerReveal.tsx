"use client";
import React from "react";

export default function SuperpowerReveal({
  superpower,
  onContinue,
}: {
  superpower: string;
  onContinue: () => void;
}) {
  return (
    <section className="w-full max-w-2xl space-y-6 text-gold" aria-live="polite">
      <h2 className="text-3xl font-serif mb-4">Your Superpower</h2>
      <div className="text-xl italic border-l-4 border-gold pl-4 py-2 bg-gold/5 rounded">
        {superpower}
      </div>
      <button
        className="btn-primary w-full py-3 mt-4"
        onClick={onContinue}
      >
        Continue
      </button>
    </section>
  );
}
