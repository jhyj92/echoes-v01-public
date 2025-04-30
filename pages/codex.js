// pages/codex.js

"use client";

import { useEffect, useState } from "react";
import { loadCodexTree, initCodex } from "@/utils/codexManager";
import CodexTree from "@/components/CodexTree";

export default function CodexPage() {
  const [tree, setTree] = useState([]);

  useEffect(() => {
    let t = loadCodexTree();
    if (!t.length) {
      const sp = localStorage.getItem("echoes_domain") || "Unknown";
      initCodex(sp).then(root=> setTree(root));
    } else {
      setTree(t);
    }
  }, []);

  return (
    <main style={{ padding:"2rem", maxWidth:"700px", margin:"0 auto" }}>
      <h1>Codex</h1>
      <CodexTree tree={tree} />
    </main>
  );
}
