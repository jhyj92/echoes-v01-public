// pages/domains.tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DomainSelector from "@/components/DomainSelector";

export default function DomainsPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[] | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined"
      ? localStorage.getItem("echoes_answers")
      : null;
    if (!raw) {
      router.replace("/onboarding");
    } else {
      try {
        setAnswers(JSON.parse(raw));
      } catch {
        router.replace("/onboarding");
      }
    }
  }, [router]);

  function pickDomain(d: string) {
    localStorage.setItem("echoes_domain", d);
    router.push("/world");
  }

  if (!answers) return null;

  return <DomainSelector answers={answers} onSelect={pickDomain} />;
}
