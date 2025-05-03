// /components/ReflectionLetter.tsx

import { useEffect, useState } from "react";
import LatencyOverlay from "./LatencyOverlay";

interface ReflectionLetterProps {
  letter: string;
  onContinue: () => void;
}

export default function ReflectionLetter({ letter, onContinue }: ReflectionLetterProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate "thinking" time before displaying the letter
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  if (!isReady) {
    return <LatencyOverlay message="The echoes are composing your reflection..." />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-black text-gold text-center space-y-8">
      <h1 className="text-3xl font-serif">Your Reflection Letter</h1>
      <p className="max-w-2xl text-lg whitespace-pre-wrap">{letter}</p>
      <button
        onClick={onContinue}
        className="px-6 py-2 bg-gold text-black rounded hover:bg-yellow-500 transition"
      >
        Continue
      </button>
    </div>
  );
}
