// components/TraitForm.js
"use client";

import { useState } from "react";
import styles from "./TraitForm.module.css";

export default function TraitForm({ onSubmit }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function discover() {
    if (!input.trim()) {
      setError("Please write something to discover your echoes.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/extractTraits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: input.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { traits } = await res.json();
      const list = traits.split(",").map((t) => t.trim());

      if (list.length !== 3 || list.some((t) => !t)) {
        throw new Error("Invalid traits format");
      }
      onSubmit(list);
    } catch (e) {
      console.error("TraitForm error:", e);
      setError(
        "The echoes are quiet right now. Please check your connection or try again."
      );
    } finally {
      setLoading(false);
    }
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

      <button
        onClick={discover}
        className={styles.discoverBtn}
        disabled={loading}
      >
        {loading ? "Listening…" : "Discover"}
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
