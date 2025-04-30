// pages/guide-intro.js
import { useRouter } from "next/router";
import GuideIntro from "@/components/GuideIntro";

export default function GuideIntroPage() {
  const router = useRouter();
  const domain = localStorage.getItem("echoes_domain");

  function handlePick(scenario) {
    localStorage.setItem("echoes_scenario", scenario);
    router.push("/hero-chat");
  }

  return <GuideIntro domain={domain} onPick={handlePick} />;
}
