// File: pages/domains.js

"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DomainSelector from "@/components/DomainSelector";

export default function DomainsPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("echoes_answers") || "[]");
    setAnswers(stored);
  }, []);

  function pickDomain(domain) {
    localStorage.setItem("echoes_domain", domain);
    router.push("/guide-intro");
  }

  // Don't render until we have answers
  if (!answers.length) return null;

  return <DomainSelector answers={answers} onSelect={pickDomain} />;
}
