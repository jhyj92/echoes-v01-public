// pages/codex.tsx
"use client";

import { useEffect, useState } from "react";
import CodexTree from "@/components/CodexTree";

/* ------------------------------------------------------------------ */
/* Types – kept minimal so we don’t need runtime transforms           */
/* ------------------------------------------------------------------ */
interface CodexEntry {
  title: string;
  children?: CodexEntry[];
}

export default function CodexPage() {
  const [entries, setEntries] = useState<CodexEntry[] | null>(null);

  /* Hydrate from localStorage on the client ------------------------ */
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR guard
    const stored = JSON.parse(
      localStorage.getItem("echoes_codex") || "[]"
    ) as CodexEntry[];
    setEntries(stored);
  }, []);

  if (entries === null) return null; // waiting for hydration

  /* --------------------------------------------------------------- */
  return (
    <main className="flex items-center justify-center min-h-screen px-4 py-12">
      <CodexTree entries={entries} />
    </main>
  );
}
