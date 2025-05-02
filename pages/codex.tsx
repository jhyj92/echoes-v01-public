// pages/codex.tsx
"use client";

import { useEffect, useState } from "react";
import CodexTree, { CodexEntry } from "@/components/CodexTree";
import Starfield from "@/components/Starfield";

export default function CodexPage() {
  const [tree, setTree] = useState<CodexEntry[] | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored: string[] = JSON.parse(localStorage.getItem("echoes_codex") || "[]");
    const entries: CodexEntry[] = stored.map((str) => ({
      title: str
    }));
    setTree(entries);
  }, []);

  if (!tree) return null;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4">
      <Starfield />
      <h1 className="text-3xl font-serif text-gold mb-6">Your Codex</h1>
      <CodexTree tree={tree} />
    </main>
  );
}
