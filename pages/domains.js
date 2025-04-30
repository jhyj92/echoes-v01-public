"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DomainSelector from "@/components/DomainSelector";

export default function DomainsPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[] | null>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("echoes_answers") || "[]");
    if (stored.length === 0) {
      router.replace("/onboarding");
    } else {
      setAnswers(stored);
    }
  }, [router]);

  if (answers === null) return null; // loading

  function pick(d: string) {
    localStorage.setItem("echoes_domain", d);
    router.push("/guide-intro");
  }

  return <DomainSelector answers={answers} onSelect={pick} />;
}
