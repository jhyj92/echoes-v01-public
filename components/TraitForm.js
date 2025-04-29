// components/TraitForm.js
"use client";

import { useState } from "react";
import styles from "./TraitForm.module.css";

export default function TraitForm({ onSubmit }) {
  const [input, setInput]   = useState("");
  const [loading, setLoad ] = useState(false);

  async function discover() {
    if (!input.trim()) return;
    setLoad(true);

    const res   = await fetch("/api/extractTraits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInput: input })
    });
    const data  = await res.json();
    const traits = data.traits.split(",").map((t) => t.trim());
    setLoad(false);
    onSubmit(traits);
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Begin Your Echo</h1>
      <p className={styles.helper}>Describe yourself in a few sentences</p>

      <textarea
        className={styles.input}
        rows={5}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Write freely…"
      />

      <button onClick={discover} className={styles.discoverBtn} disabled={loading}>
        {loading ? "Discovering…" : "Discover"}
      </button>
    </div>
  );
}
