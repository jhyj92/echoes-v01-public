// pages/codex.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { loadCodex } from "@/utils/codexManager";

export default function CodexPage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(loadCodex());
  }, []);

  return (
    <main style={{ maxWidth: "700px", margin: "8vh auto", textAlign: "center" }} className="fade">
      <h1>Codex</h1>
      {entries.length === 0 ? (
        <p>No echoes recorded yet.</p>
      ) : (
        entries.map((e, i) => (
          <div
            key={i}
            style={{
              margin: "24px 0",
              borderLeft: "2px solid var(--clr-primary)",
              paddingLeft: "12px",
              textAlign: "left"
            }}
          >
            <div style={{ opacity: 0.6, fontSize: ".8rem" }}>
              {new Date(e.timestamp).toLocaleString()}
            </div>
            <p style={{ marginTop: "8px" }}>{e.content}</p>
          </div>
        ))
      )}
      <button
        className="button-poetic"
        style={{ marginTop: "32px" }}
        onClick={() => router.back()}
      >
        Back
      </button>
    </main>
  );
}
