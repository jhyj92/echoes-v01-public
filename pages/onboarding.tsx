/* ----------------------------------------------------------------
   Onboarding ▸ Trait Interview (10 questions)
-----------------------------------------------------------------*/
"use client";

import { useRouter } from "next/router";
import Interviewer from "@/components/Interviewer";
import LatencyOverlay from "@/components/LatencyOverlay";
import Starfield from "@/components/Starfield";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = (answers) => {
    localStorage.setItem("echoes_answers", JSON.stringify(answers));
    router.push("/domains");
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen px-6 py-12">
      <Starfield />
      <LatencyOverlay />
      <Interviewer onComplete={handleComplete} />
    </main>
  );
}
