// components/HeroChat.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import { loadChat, saveChat } from "@/utils/chatManager";
import LatencyOverlay from "@/components/LatencyOverlay";
import Bridge from "@/components/Bridge";

export default function HeroChat() {
  const router = useRouter();
  const [history, setHistory] = useState(loadChat());
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [overlay, setOverlay] = useState(false);

  // Seed with chosen scenario on mount
  useEffect(() => {
    if (history.length === 0) {
      const scenario = localStorage.getItem("echoes_scenario") || "";
      setHistory([{ role: "hero", text: scenario }]);
    }
  }, []);

  // Persist after every update
  useEffect(() => {
    saveChat(history);
    // After 10 hero messages, move to reflection
    const heroCount = history.filter((m) => m.role === "hero").length;
    if (heroCount >= 10) {
      router.push("/reflection");
    }
  }, [history, router]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input.trim() };
    setHistory((h) => [...h, userMsg]);
    setInput("");
    setLoading(true);
    const timer = setTimeout(() => setOverlay(true), 5000);

    try {
      const prompt = history
        .concat(userMsg)
        .map((m) => `${m.role}: ${m.text}`)
        .join("\n");
      const res = await fetchWithTimeout(
        "/api/heroChat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        },
        10000
      );
      const { reply } = await res.json();
      setHistory((h) => [...h, { role: "hero", text: reply }]);
    } catch {
      setHistory((h) => [
        ...h,
        { role: "hero", text: "The hero’s voice falters…" },
      ]);
    } finally {
      clearTimeout(timer);
      setOverlay(false);
      setLoading(false);
    }
  }

  return (
    <div className="px-6 py-12 max-w-2xl mx-auto">
      {overlay && <LatencyOverlay text="The echoes are responding…" />}
      <Bridge text="Your conversation" delay={0.2} />

      <div className="space-y-2 my-6 overflow-y-auto max-h-[60vh]">
        {history.map((m, i) => (
          <p
            key={i}
            className={`${
              m.role === "user" ? "text-right" : "text-left"
            } opacity-90`}
          >
            <strong>
              {m.role === "user" ? "You" : "Hero"}:
            </strong>{" "}
            {m.text}
          </p>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 rounded border border-gold bg-transparent px-4 py-3 text-gold placeholder:text-gold/50 focus:outline-none"
        />
        <button
          className="btn-primary"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? "Thinking…" : "Send"}
        </button>
      </div>
    </div>
  );
}
