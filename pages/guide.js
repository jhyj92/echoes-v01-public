// pages/guide.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { assignGuide } from "@/utils/assignGuide";

export default function GuidePage() {
  const router = useRouter();
  const [guide, setGuide] = useState(null);

  useEffect(() => {
    const traits = JSON.parse(localStorage.getItem("echoes_traits") || "[]");
    const world  = JSON.parse(localStorage.getItem("echoes_world")  || "null");

    // If no prior data, send back to home
    if (!traits.length || !world) {
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

      <button
        onClick={() => router.push("/conversation")}
        className="primaryBtn"
      >
        Begin Conversation
      </button>

      <style jsx>{`
        .guide-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        h1 {
          font-size: 2rem;
        }
        .primaryBtn {
          padding: 0.6rem 1.4rem;
          background: #1e40af;
          color: #fff;
          border: none;
          border-radius: 4px;
        }
      `}</style>
    </main>
  );
}

