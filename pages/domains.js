// pages/domains.js
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DomainSelector from "@/components/DomainSelector";

export default function DomainsPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState(null);     // null = loading

  // hydrate answers from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("echoes_answers") || "[]");
    if (stored.length === 0) {
      // user skipped interviewer – send them back
      router.replace("/onboarding");
    } else {
      setAnswers(stored);
    }
  }, [router]);

  // still loading
  if (answers === null) return null;

  function pickDomain(domain) {
    localStorage.setItem("echoes_domain", domain);
    router.push("/guide-intro");
  }

  return <DomainSelector answers={answers} onSelect={pickDomain} />;
}
