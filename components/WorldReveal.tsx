// components/WorldReveal.tsx
"use client";

export default function WorldReveal({ world }: { world: string }) {
  const art = {
    "Dream-Sea":      "/worlds/dreamsea.jpg",
    Emberwake:        "/worlds/emberwake.jpg",
    Stormlight:       "/worlds/stormlight.jpg",
    Whispergrove:     "/worlds/whispergrove.jpg",
  }[world] || "";

  return (
    <div className="relative flex items-center justify-center min-h-screen text-center overflow-hidden">
      <img
        src={art}
        alt=""  /* decorative */
        className="absolute inset-0 w-full h-full object-cover z-[-10]"
      />
      <h1 className="text-5xl md:text-6xl font-serif text-gold drop-shadow-lg">
        {world} Realm
      </h1>
    </div>
  );
}
