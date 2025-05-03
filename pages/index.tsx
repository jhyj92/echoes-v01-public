// pages/index.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Starfield from "../components/Starfield";
import landingTaglines from "../data/landingTaglines";

export default function Home() {
  const router = useRouter();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [journeyDestination, setJourneyDestination] = useState<string | null>(null);
  const [hasExistingJourney, setHasExistingJourney] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Rotate taglines
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prevIndex) => (prevIndex + 1) % landingTaglines.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const answers = localStorage.getItem("echoes_answers");
    const domain = localStorage.getItem("echoes_domain");
    const superpower = localStorage.getItem("echoes_superpower");

    if (superpower && superpower.trim() !== "") {
      setHasExistingJourney(true);
      setJourneyDestination("/hero");
    } else if (domain && domain.trim() !== "") {
      setHasExistingJourney(true);
      setJourneyDestination("/guide");
    } else if (answers && answers.trim() !== "") {
      setHasExistingJourney(true);
      setJourneyDestination("/domains");
    } else {
      setHasExistingJourney(false);
      setJourneyDestination(null);
    }

    setIsLoading(false);
  }, [router.isReady]);

  if (isLoading) return null;

  return (
    <main className="flex-1 flex flex-col items-center justify-center w-full bg-black text-white px-4 relative overflow-hidden">
      <Starfield />
      <h1 className="text-5xl md:text-6xl font-serif mb-6 fade-in z-10">
        Echoes
      </h1>
      <p className="text-xl mb-8 fade-in z-10">
        {landingTaglines[taglineIndex]}
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 fade-in z-10">
        {hasExistingJourney && journeyDestination && (
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
    </main>
  );
}
