// components/TraitForm.js

"use client";

import { useState } from "react";
import styles from "./TraitForm.module.css";

export default function TraitForm({ onSubmit }) {
  const [input,  setInput ] = useState("");
  const [loading,setLoad ] = useState(false);
  const [error,  setErr   ] = useState("");

  async function discover() {
    if (!input.trim()) {
      setErr("Please write something to discover your echoes.");
      return;
    }
    setLoad(true);
    setErr("");
    try {
      const res = await fetch("/api/extractTraits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: input })
      });

      if (!res.ok) {
        throw new Error(`Server responded ${res.status}`);
      }

      const { traits } = await res.json();
      const list = traits.split(",").map((t) => t.trim());

      if (list.length !== 3 || list.some((t) => t.length === 0)) {
        throw new Error("Invalid traits format");
      }

      onSubmit(list);
    } catch (e) {
      console.error("TraitForm error:", e);
      setErr(
        "The echoes are quiet right now. Check your connection or try again."
      );
    } finally {
      setLoad(false);
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

      {error && (
        <p style={{ color: "#F66", marginTop: "12px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
