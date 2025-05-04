"use client";

import { useEffect, useState } from "react";
import CodexTree from "@/components/CodexTree";
import { CodexNode } from "@/utils/codexManager";
import Starfield from "@/components/Starfield";

export default function CodexPage() {
  const [tree, setTree] = useState<CodexNode[] | null>(null);

  const refresh = () => {
    const codex = loadCodexTree();
    setTree(codex ?? []);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    refresh();
  }, []);

  if (!tree) return null;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 bg-black text-gold">
      <Starfield />
      <h1 className="text-3xl font-serif mb-6">Your Codex</h1>
      <CodexTree tree={tree} refresh={refresh} />
    </main>
  );
}
