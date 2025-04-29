"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import assignGuide from "@/utils/assignGuide";

export default function GuidePage() {
  const router = useRouter();
  const [guide, setGuide] = useState(null);

  useEffect(() => {
    const domain = JSON.parse(localStorage.getItem("echoes_domain") || "null");
    if (!domain) {
      router.replace("/");
      return;
    }
    setGuide(assignGuide(domain));
  }, []);

  if (!guide) return null;

  return (
    <main className="guide-screen">
      <h1>{guide.name}</h1>
      <p className="guide-intro">{guide.intro}</p>
    </main>
  );
}
