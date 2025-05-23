"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LatencyOverlay from "@/components/LatencyOverlay";

export default function SuperpowerPage() {
  const router = useRouter();
  const [domain, setDomain] = useState<string>("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [superpower, setSuperpower] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedDomain = localStorage.getItem("echoes_domain") || "";
    const savedAnswers = localStorage.getItem("echoes_guide");
    setDomain(savedDomain);
    setAnswers(savedAnswers ? JSON.parse(savedAnswers) : []);
  }, []);

  useEffect(() => {
    if (domain && answers.length >= 10) {
      (async () => {
        try {
          const res = await fetch("/api/superpower", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ domain, reflections: answers }),
          });
          if (!res.ok) throw new Error("Failed to fetch superpower");
          const { superpower: sp, description: desc } = await res.json();
          setSuperpower(sp);
          setDescription(desc || "");
          localStorage.setItem("echoes_superpower", sp);
        } catch (error) {
          setError("Failed to generate your superpower. Please try again.");
          console.error("Failed to fetch superpower:", error);
        }
      })();
    }
  }, [domain, answers]);

  useEffect(() => {
    if (superpower) {
      router.push("/hero");
    }
  }, [superpower, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-black text-gold text-center space-y-6">
      <LatencyOverlay />
      <p>Weaving your superpower...</p>
      {error && <p className="text-red-500 italic mt-4">{error}</p>}
    </main>
  );
}
