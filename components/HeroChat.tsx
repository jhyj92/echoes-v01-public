// components/HeroChat.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";
import { loadHistory, saveHistory } from "@/utils/chatManager";

interface Props {
  scenario: string;
}

export default function HeroChat({ scenario }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<
    { from: "hero" | "user"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // On mount: load history or start new convo
  useEffect(() => {
    const stored = loadHistory(scenario);
    if (stored && stored.length) {
      setMessages(stored);
    } else {
      // Kick off with system prompt
      const init = [
        {
          from: "hero",
          text: `You find yourself in "${scenario}". The hero awaits your counsel.`,
        },
      ];
      setMessages(init);
      saveHistory(scenario, init);
    }
  }, [scenario]);

  // Send user message
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { from: "user" as const, text: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    saveHistory(scenario, updated);
    setInput("");
    setLoading(true);

    // Call API
    try {
      const res = await fetchWithTimeout("/api/heroChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, messages: updated }),
      });
      const { reply, done } = await res.json();
      const heroMsg = { from: "hero" as const, text: reply };
      const withHero = [...updated, heroMsg];
      setMessages(withHero);
      saveHistory(scenario, withHero);

      if (done) {
        router.push("/reflection");
      }
    } catch {
      const fallback = {
        from: "hero" as const,
        text: "The echoes have paused… Try again shortly.",
      };
      const withFallback = [...updated, fallback];
      setMessages(withFallback);
      saveHistory(scenario, withFallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <LatencyOverlay />

      <ul className="space-y-4 w-full max-w-xl">
        {messages.map((m, i) => (
          <li key={i} className={m.from === "hero" ? "italic" : ""}>
            <strong>{m.from === "hero" ? "Hero" : "You"}:</strong> {m.text}
          </li>
        ))}
      </ul>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl flex items-center space-x-2 mt-4"
      >
        <input
          type="text"
          disabled={loading}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Respond to the hero…"
          className="flex-1 rounded bg-transparent border border-gold/40 px-3 py-2 focus:outline-none"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          Send
        </button>
      </form>

      {loading && <p className="italic mt-2">The echoes are listening…</p>}
    </main>
  );
}
