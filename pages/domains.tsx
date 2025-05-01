// pages/domains.js
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DomainSelector from "@/components/DomainSelector";

export default function DomainsPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState(null);
  const [domains, setDomains] = useState([]);

  // Load answers from localStorage (client-only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = JSON.parse(localStorage.getItem("echoes_answers") || "[]");
    setAnswers(stored);
  }, []);

  // Call Domains API once answers arrive
  useEffect(() => {
    if (answers) {
      fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })
        .then((res) => res.json())
        .then((data) => setDomains(data.domains))
        .catch(() => {
          /* TODO: friendly error fallback */
        });
    }
  }, [answers]);

  if (!answers) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="text-3xl font-serif mb-6 fade-in">
        Discover Your Domain
      </h1>
      <DomainSelector
        domains={domains}
        onSelect={(domain) => {
          localStorage.setItem("echoes_domain", domain);
          router.push("/world");
        }}
      />
    </main>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
