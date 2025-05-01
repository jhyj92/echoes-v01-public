// pages/guide.js
"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";
import HeroChat from "@/components/HeroChat";

export default function GuidePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const scenario = localStorage.getItem("echoes_scenario");
    if (!scenario) router.replace("/guide-intro");
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <HeroChat />
    </main>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
