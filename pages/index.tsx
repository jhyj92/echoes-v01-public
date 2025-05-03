import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Starfield from "../components/Starfield";
import landingTaglines from "../data/landingTaglines";

export default function Home() {
  const router = useRouter();
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    // Rotate taglines every 5 seconds
    const interval = setInterval(() => {
      setTaglineIndex((prevIndex) => (prevIndex + 1) % landingTaglines.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for existing user progress
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
    // If no progress, stay on the landing page
  }, [router]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <Starfield />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl font-bold mb-4 animate-fade-in">
          Echoes
        </h1>
        <p className="text-xl mb-8 animate-fade-in delay-500">
          {landingTaglines[taglineIndex]}
        </p>
        <div className="flex space-x-4 animate-fade-in delay-1000">
          <button
            onClick={() => router.push("/onboarding")}
            className="px-6 py-2 bg-gold text-black font-semibold rounded hover:bg-yellow-500 transition"
          >
            Start Journey
          </button>
          <button
            onClick={() => router.push("/codex")}
            className="px-6 py-2 border border-gold text-gold font-semibold rounded hover:bg-gold hover:text-black transition"
          >
            View Codex
          </button>
        </div>
      </div>
    </div>
  );
}
