// pages/onboarding.tsx
"use client";

import { useRouter } from "next/router";
import Starfield from "@/components/Starfield";
import LatencyOverlay from "@/components/LatencyOverlay";
import Interviewer from "@/components/Interviewer";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = (answers: string[]) => {
    localStorage.setItem("echoes_answers", JSON.stringify(answers));
    router.push("/domains");
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4">
      <Starfield />
      <LatencyOverlay />
      <Interviewer onComplete={handleComplete} />
    </main>
  );
}
