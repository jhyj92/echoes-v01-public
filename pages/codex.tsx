/* ----------------------------------------------------------------
   Codex ▸ tree of earned entries
-----------------------------------------------------------------*/
"use client";

import { useEffect, useState } from "react";
import CodexTree from "@/components/CodexTree";

export default function CodexPage() {
  const [entries, setEntries] = useState<string[] | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = JSON.parse(localStorage.getItem("echoes_codex") || "[]");
    setEntries(stored);
  }, []);

  if (!entries) return null;

  return (
    <main className="flex items-center justify-center min-h-screen px-4 py-12">
      <CodexTree tree={entries} />
    </main>
  );
}
