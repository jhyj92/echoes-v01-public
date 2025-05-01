// pages/codex.tsx
import { useEffect, useState } from "react";
import CodexTree from "@/components/CodexTree";

export default function CodexPage() {
  const [entries, setEntries] = useState<string[] | null>(null);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("echoes_codex") ?? "[]"
    );
    setEntries(stored);
  }, []);

  if (!entries) return null;

  return (
    <main className="flex items-center justify-center min-h-screen px-4 py-12">
      <CodexTree entries={entries} />
    </main>
  );
}
