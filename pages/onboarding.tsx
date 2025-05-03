"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Starfield from "@/components/Starfield";
import LatencyOverlay from "@/components/LatencyOverlay";
import Interviewer from "@/components/Interviewer";

export default function OnboardingPage() {
  const router = useRouter();
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const answers = localStorage.getItem("echoes_answers");
    if (answers) {
      router.replace("/domains");
    }
  }, [router.isReady]);

  const handleComplete = (answers: string[]) => {
    localStorage.setItem("echoes_answers", JSON.stringify(answers));
    setIsComplete(true);
    router.push("/domains");
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <Starfield />
      <LatencyOverlay />

      {!isComplete && <Interviewer onComplete={handleComplete} />}
    </main>
  );
}
