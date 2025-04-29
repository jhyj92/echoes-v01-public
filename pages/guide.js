// pages/guide.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import assignGuide from "@/utils/assignGuide";

export default function GuidePage() {
  const router = useRouter();
  const [guide, setGuide] = useState(null);

  useEffect(() => {
    const traits = JSON.parse(localStorage.getItem("echoes_traits") || "[]");

    if (!traits.length) {
      router.replace("/");
      return;
    }

    setGuide(assignGuide(traits));
  }, []);

  if (!guide) return null; // loading

  return (
    <main className="guide-screen">
      <h1>{guide.name}</h1>
      <p className="guide-intro">{guide.intro}</p>
    </main>
  );
}
