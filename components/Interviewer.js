// components/Interviewer.js
"use client";

import { useEffect, useState } from "react";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";
import Bridge from "@/components/Bridge";

export default function Interviewer({ onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]     = useState([]);
  const [current, setCurrent]     = useState(0);
  const [loading, setLoading]     = useState(true);
  const [overlay, setOverlay]     = useState(false);

  // Initial fetch of first question
  useEffect(() => {
    askQuestion();
  }, []);

  async function askQuestion() {
    setLoading(true);
    const overlayTimer = setTimeout(() => setOverlay(true), 1000);

    try {
      const prompt =
        current === 0
          ? "Each human you speak to has a single, specific superpower. Ask the first of 10 poetic questions to uncover mine."
          : `My previous answer: "${answers[current - 1]}". Ask question #${current + 1} to learn my unique superpower.`;

      const res = await fetchWithTimeout(
        "/api/interviewer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        },
        10000
      );

      if (!res.ok) throw new Error("Interview fetch failed");
      const { question } = await res.json();
      setQuestions((qs) => [...qs, question]);
    } catch (e) {
      console.error(e);
      setQuestions((qs) => [...qs, "The echoes pause. Try again?"]);
    } finally {
      clearTimeout(overlayTimer);
      setOverlay(false);
      setLoading(false);
    }
  }

  function submitAnswer(ans) {
    if (!ans.trim()) return;  // ← guard against empty answers
    const next = [...answers, ans.trim()];
    setAnswers(next);
    if (next.length >= 10) {
      onComplete(next);
    } else {
      setCurrent(next.length);
      askQuestion();
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      {overlay && <LatencyOverlay text="The echoes are thinking…" />}
      <Bridge text={`Question ${current + 1} of 10`} delay={0} />

      {loading ? (
        <p>Listening…</p>
      ) : (
        <>
          <p style={{ fontStyle: "italic", fontSize: "1.1rem" }}>
            {questions[current]}
          </p>
          <input
            type="text"
            style={{
              width: "100%",
              padding: "12px",
              margin: "1rem 0",
              fontSize: "1rem",
              border: "1px solid #444",
              background: "#0F1116",
              color: "#fff",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                submitAnswer(e.target.value);
                e.target.value = "";
              }
            }}
          />
        </>
      )}
    </div>
  );
}
