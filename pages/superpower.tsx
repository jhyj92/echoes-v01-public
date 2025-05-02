// pages/superpower.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LatencyOverlay from "@/components/LatencyOverlay";
import ReflectionLetter from "@/components/ReflectionLetter";

export default function SuperpowerPage() {
  const router = useRouter();
  const [domain, setDomain] = useState<string>("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [superpower, setSuperpower] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    setDomain(localStorage.getItem("echoes_domain") || "");
    setAnswers(JSON.parse(localStorage.getItem("echoes_guide") || "[]"));
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
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-black text-gold">
      <LatencyOverlay />
      {!superpower ? (
        <p>Weaving your superpower...</p>
      ) : (
        <div className="prose prose-invert">
          <h1>Your Superpower</h1>
          <h2 className="text-2xl font-serif">{superpower}</h2>
          <p>{description}</p>
        </div>
      )}
    </main>
  );
}
