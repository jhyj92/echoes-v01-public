// pages/onboarding.tsx
import { useRouter } from "next/router";
import Interviewer from "@/components/Interviewer";
import LatencyOverlay from "@/components/LatencyOverlay";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <main className="flex items-center justify-center min-h-screen px-4 py-12">
      <LatencyOverlay />
      <Interviewer
        onComplete={(answers: string[]) => {
          localStorage.setItem("echoes_answers", JSON.stringify(answers));
          router.push("/domains");
        }}
      />
    </main>
  );
}
