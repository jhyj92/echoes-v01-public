// pages/codex.js
"use client";

import { useEffect, useState } from "react";
import CodexTree from "@/components/CodexTree";

export default function CodexPage() {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = JSON.parse(localStorage.getItem("echoes_codex") || "[]");
    setEntries(stored);
  }, []);

  if (!entries) return null;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <CodexTree entries={entries} />
    </main>
  );
}
