"use client";
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/router";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";
import { loadHistory, saveHistory, ChatMessage } from "@/utils/chatManager";

export interface HeroChatProps {
  scenario: string;
  hero: string;
}

const STORAGE_HISTORY_KEY = "echoes_history";
const STORAGE_SCENARIO_KEY = "echoes_scenario";
const STORAGE_HERO_KEY = "echoes_hero";

export default function HeroChat({ scenario, hero }: HeroChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const stored: ChatMessage[] = loadHistory(STORAGE_HISTORY_KEY);
    if (stored.length) {
      setMessages(stored);
      const heroCount = stored.filter(m => m.from === "hero").length;
      if (heroCount >= 10) setPaused(true);
    } else {
      const init: ChatMessage[] = [
        { from: "hero", text: `You find yourself in “${scenario}.” ${hero} awaits your counsel.` },
      ];
      setMessages(init);
      saveHistory(STORAGE_HISTORY_KEY, init);
      localStorage.setItem(STORAGE_SCENARIO_KEY, scenario);
      localStorage.setItem(STORAGE_HERO_KEY, hero);
    }
  }, [scenario, hero]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || paused) return;

    const userMsg: ChatMessage = { from: "user", text: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    saveHistory(STORAGE_HISTORY_KEY, updated);
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
          history: updated,
          userMessage: userMsg.text,
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const { reply, done } = await res.json();

      const heroMsg: ChatMessage = { from: "hero", text: reply };
      const withHero = [...updated, heroMsg];
      setMessages(withHero);
      saveHistory(STORAGE_HISTORY_KEY, withHero);

      if (done) setPaused(true);
    } catch (err) {
      setError("Failed to get a response from the hero. Please try again.");
      console.error("HeroChat API error:", err);
      const fallback: ChatMessage = {
        from: "hero",
        text: "The echoes have fallen silent… They’ll return any moment.",
      };
      const withFallback = [...updated, fallback];
      setMessages(withFallback);
      saveHistory(STORAGE_HISTORY_KEY, withFallback);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setPaused(false);
    setError(null);
  };

  const handleExamine = () => {
    router.push("/reflection");
  };

  const renderMessage = (m: ChatMessage, idx: number) => {
    if (m.from === "hero") {
      const heroCount = messages.slice(0, idx + 1).filter(msg => msg.from === "hero").length;
      return (
        <li key={idx} className="italic">
          <strong>{`Hero [${heroCount}]:`}</strong> {m.text}
        </li>
      );
    }
    return (
      <li key={idx}>
        <strong>You:</strong> {m.text}
      </li>
    );
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <LatencyOverlay />

      <ul
        className="space-y-4 w-full max-w-xl overflow-y-auto max-h-[60vh]"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map(renderMessage)}
      </ul>

      {paused ? (
        <section className="mt-6 space-x-4">
          <p className="mb-4 italic">The hero has paused to reflect on your superpower.</p>
          <button
            onClick={handleContinue}
            className="btn-primary mr-4"
            aria-label="Continue conversation with hero"
          >
            Continue Conversation
          </button>
          <button
            onClick={handleExamine}
            className="btn-secondary"
            aria-label="Examine my superpower with hero"
          >
            Examine Superpower
          </button>
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl flex items-center space-x-2 mt-4"
        >
          <input
            type="text"
            disabled={loading}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Respond to the hero…"
            className="flex-1 rounded bg-transparent border border-gold/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
            autoFocus
            aria-label="Your message"
          />
          <button type="submit" disabled={loading} className="btn-primary">
            Send
          </button>
        </form>
      )}

      {loading && <p className="italic mt-2">The echoes are listening…</p>}
      {error && <p className="text-red-500 italic mt-2" role="alert">{error}</p>}
    </main>
  );
}
