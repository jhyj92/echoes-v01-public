// components/LatencyOverlay.js
export default function LatencyOverlay({ text = "The echoes are thinking…" }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 text-gold text-xl px-4 text-center">
      {text}
    </div>
  );
}
