// pages/codex.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function CodexPage() {
  const [entries, setEntries] = useState([]);
  const router = useRouter();

  useEffect(() => {
    setEntries(JSON.parse(localStorage.getItem("echoes_codex") || "[]"));
  }, []);

  return (
    <main style={{ maxWidth: "700px", margin: "8vh auto" }} className="fade">
      <h1>Codex</h1>
      {entries.length === 0 && <p>No echoes recorded yet.</p>}
      {entries.map((e, i) => (
        <div key={i} style={{ margin: "24px 0", borderLeft: "2px solid var(--clr-primary)", paddingLeft: "12px" }}>
          <div style={{ opacity: .6, fontSize: ".8rem" }}>
            {new Date(e.timestamp).toLocaleString()}
          </div>
          <p>{e.content}</p>
        </div>
      ))}
      <button className="button-poetic" onClick={() => router.back()}>
        Back
      </button>
    </main>
  );
}
