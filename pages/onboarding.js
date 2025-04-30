// pages/onboarding.js
import { useRouter } from "next/router";
import Interviewer from "@/components/Interviewer";

export default function Onboarding() {
  const router = useRouter();

  function handleComplete(answers) {
    // store for trait-extraction
    localStorage.setItem("echoes_answers", JSON.stringify(answers));
    router.push("/domains");
  }

  return <Interviewer onComplete={handleComplete} />;
}
