"use client";

import { useEffect, useState } from "react";
import CodexTree, { CodexEntry } from "@/components/CodexTree";
import Starfield from "@/components/Starfield";

export default function CodexPage() {
  const [tree, setTree] = useState<CodexEntry[] | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored: string[] = JSON.parse(localStorage.getItem("echoes_codex") || "[]");

    // FIX: Map stored strings into valid CodexEntry format
    const entries: CodexEntry[] = stored.map((str, index) => ({
      id: `flat-${index}`,
      label: str,
      children: [],
    }));

    setTree(entries);
  }, []);

  if (!tree) return null;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <Starfield />
      <h1 className="text-3xl font-serif mb-6">Your Codex</h1>
      <CodexTree tree={tree} />
    </main>
  );
}
