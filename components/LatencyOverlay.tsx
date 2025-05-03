"use client";

export default function LatencyOverlay() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/80 text-gold text-lg z-50 animate-fade-in"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="italic">The echoes are listening…</p>
    </div>
  );
}
