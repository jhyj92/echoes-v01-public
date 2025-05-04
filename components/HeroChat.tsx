"use client";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";
import { loadHistory, saveHistory, ChatMessage } from "@/utils/chatManager";

export interface HeroChatProps {
  scenario: string;
  hero: string;
}

export default function HeroChat({ scenario, hero }: HeroChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = `${scenario}-${hero}`;
    const stored: ChatMessage[] = loadHistory(key);
    if (stored.length) {
      setMessages(stored);
    } else {
      const init: ChatMessage[] = [
        {
          from: "hero",
          text: `You find yourself in “${scenario}.” ${hero} awaits your counsel.`,
        },
      ];
      setMessages(init);
      saveHistory(key, init);
    }
  }, [scenario, hero]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const key = `${scenario}-${hero}`;
    const userMsg: ChatMessage = { from: "user", text: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    saveHistory(key, updated);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithTimeout("/api/heroChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          hero,
          history: messages, // previous messages
          userMessage: userMsg.text, // current message
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const { reply, done } = await res.json();
      const heroMsg: ChatMessage = { from: "hero", text: reply };
      const withHero = [...updated, heroMsg];
      setMessages(withHero);
      saveHistory(key, withHero);

      if (done) router.push("/reflection");
    } catch (err) {
      setError("Failed to get a response from the hero. Please try again.");
      console.error("HeroChat API error:", err);
      const fallback: ChatMessage = {
        from: "hero",
        text: "The echoes have fallen silent… They’ll return any moment.",
      };
      const withFallback = [...updated, fallback];
      setMessages(withFallback);
      saveHistory(key, withFallback);
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
            <strong>{m.from === "hero" ? hero : "You"}:</strong> {m.text}
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
          aria-label="Your message"
        />
        <button type="submit" disabled={loading} className="btn-primary">
          Send
        </button>
      </form>

      {loading && <p className="italic mt-2">The echoes are listening…</p>}
      {error && <p className="text-red-500 italic mt-2">{error}</p>}
    </main>
  );
}
