"use client";

import Image from "next/image";

interface WorldRevealProps {
  world: string;
}

const worldImages: Record<string, string> = {
  "Dream-Sea": "/worlds/Dream-Sea.jpg",
  Emberwake: "/worlds/Emberwake.jpg",
  Stormlight: "/worlds/Stormlight.jpg",
  Whispergrove: "/worlds/Whispergrove.jpg",
};

export default function WorldReveal({ world }: WorldRevealProps) {
  const imgSrc = worldImages[world];

  if (!imgSrc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gold">
        <p className="italic">Unknown world…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gold animate-fade-in">
      <Image
        src={imgSrc}
        alt={world}
        width={512}
        height={512}
        className="rounded-xl shadow-lg animate-pulse"
      />
      <h1 className="text-4xl mt-6 font-serif">{world}</h1>
    </div>
  );
}
