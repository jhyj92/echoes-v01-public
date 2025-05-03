"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Starfield from "../components/Starfield";
import landingTaglines from "../data/landingTaglines";

export default function Home() {
  const router = useRouter();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [hasExistingJourney, setHasExistingJourney] = useState(false);
  const [journeyDestination, setJourneyDestination] = useState("/onboarding");
  const [isLoading, setIsLoading] = useState(true);

  // Rotate taglines
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prevIndex) => (prevIndex + 1) % landingTaglines.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check for existing journey without auto-redirecting
  useEffect(() => {
    if (!router.isReady) return;

    const answers = localStorage.getItem("echoes_answers");
    const domain = localStorage.getItem("echoes_domain");
    const superpower = localStorage.getItem("echoes_superpower");

    // Just detect if journey exists and where to resume from
    if (superpower && superpower.trim() !== "") {
      setHasExistingJourney(true);
      setJourneyDestination("/hero");
    } else if (domain && domain.trim() !== "") {
      setHasExistingJourney(true);
      setJourneyDestination("/guide");
    } else if (answers && answers.trim() !== "") {
      setHasExistingJourney(true);
      setJourneyDestination("/domains");
    }

    setIsLoading(false);
  }, [router.isReady]);

  if (isLoading) return null;

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

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 z-10 fade-in">
          {hasExistingJourney && (
            <button
              onClick={() => router.push(journeyDestination)}
              className="btn-primary"
            >
              Continue Journey
            </button>
          )}
          
          <button
            onClick={() => router.push("/onboarding")}
            className={`${hasExistingJourney ? "btn-outline" : "btn-primary"}`}
          >
            {hasExistingJourney ? "New Journey" : "Start Journey"}
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
