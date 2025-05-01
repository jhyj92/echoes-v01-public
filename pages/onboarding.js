// pages/onboarding.js
"use client";

import { useRouter } from "next/router";
import Interviewer from "@/components/Interviewer";
import LatencyOverlay from "@/components/LatencyOverlay";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = (answers) => {
    localStorage.setItem("echoes_answers", JSON.stringify(answers));
    router.push("/domains");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <LatencyOverlay />
      <Interviewer onComplete={handleComplete} />
    </main>
  );
}
