// pages/guide.js
"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";
import HeroChat from "@/components/HeroChat";

export default function GuidePage() {
  const router = useRouter();

  useEffect(() => {
    const scenario = typeof window !== "undefined"
      ? localStorage.getItem("echoes_scenario")
      : null;
    if (!scenario) {
      router.replace("/guide-intro");
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <HeroChat />
    </main>
  );
}

// Force this page to always render server-side (no static prerender)
export async function getServerSideProps() {
  return { props: {} };
}
