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

  useEffect(() => {
    const savedDomain = localStorage.getItem("echoes_domain") || "";
    const savedAnswers = localStorage.getItem("echoes_guide");
    setDomain(savedDomain);
    setAnswers(savedAnswers ? JSON.parse(savedAnswers) : []);
  }, []);

  useEffect(() => {
    if (domain && answers.length >= 10) {
      (async () => {
        const res = await fetch("/api/superpower", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain, guideAnswers: answers }),
        });
        const { superpower: sp, description: desc } = await res.json();
        setSuperpower(sp);
        setDescription(desc);
        localStorage.setItem("echoes_superpower", sp);
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
    </main>
  );
}
