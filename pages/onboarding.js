// pages/onboarding.js
"use client";

import Interviewer from "@/components/Interviewer";
import { useRouter } from "next/router";

export default function Onboarding() {
  const router = useRouter();

  function handleComplete(answers) {
    localStorage.setItem("echoes_answers", JSON.stringify(answers));
    router.push("/domains");
  }

  return <Interviewer onComplete={handleComplete} />;
}
