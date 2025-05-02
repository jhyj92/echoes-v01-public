// components/HeroChat.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import fetchWithTimeout from "@/utils/fetchWithTimeout";
import LatencyOverlay from "@/components/LatencyOverlay";
import { loadHistory, saveHistory, ChatMessage } from "@/utils/chatManager";

interface Props {
  scenario: string;
}

export default function HeroChat({ scenario }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored: ChatMessage[] = loadHistory(scenario);
    if (stored.length) {
      setMessages(stored);
    } else {
      const init: ChatMessage[] = [
        {
          from: "hero",
          text: `You find yourself in “${scenario}.” The hero awaits your counsel.`,
        },
      ];
      setMessages(init);
      saveHistory(scenario, init);
    }
  }, [scenario]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { from: "user", text: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    saveHistory(scenario, updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetchWithTimeout("/api/heroChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, messages: updated }),
      });
      const { reply, done } = await res.json();
      const heroMsg: ChatMessage = { from: "hero", text: reply };
      const withHero = [...updated, heroMsg];
      setMessages(withHero);
      saveHistory(scenario, withHero);

      if (done) router.push("/reflection");
    } catch {
      const fallback: ChatMessage = {
        from: "hero",
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

      <ul className="space-y-4 w-full max-w-xl
