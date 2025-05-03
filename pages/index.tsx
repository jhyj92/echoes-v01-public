import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Starfield from "../components/Starfield";
import landingTaglines from "../data/landingTaglines";

export default function Home() {
  const router = useRouter();
  const [taglineIndex, setTaglineIndex] = useState(0);

  // Tagline rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prevIndex) => (prevIndex + 1) % landingTaglines.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Resume flow logic
  useEffect(() => {
    const answers = localStorage.getItem("echoes_answers");
    const domain = localStorage.getItem("echoes_domain");
    const superpower = localStorage.getItem("echoes_superpower");

    if (superpower && superpower.trim() !== "") {
      router.replace("/hero");
    } else if (domain && domain.trim() !== "") {
      router.replace("/guide");
    } else if (answers && answers.trim() !== "") {
      router.replace("/domains");
    }
  }, [router]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <Starfield />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-6xl font-serif mb-6 fade-in z-10">
          Echoes
        </h1>

        <p className="text-xl mb-8 fade-in z-10">
          {landingTaglines[taglineIndex]}
        </p>

        <div className="flex space-x-4 z-10 fade-in">
          <button
            onClick={() => router.push("/onboarding")}
            className="btn-primary"
          >
            Start Journey
          </button>

          <button
            onClick={() => router.push("/codex")}
            className="btn-outline"
          >
            View Codex
          </button>
        </div>
      </div>
    </main>
  );
}
