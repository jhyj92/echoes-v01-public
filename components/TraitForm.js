// components/TraitForm.js
"use client";

import { useState } from "react";
import styles from "./TraitForm.module.css";

export default function TraitForm({ onSubmit }) {
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState([]);

  function addTrait() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setDraft([...draft, trimmed]);
    setInput("");
  }

  return (
    <div className={styles.traitForm}>
      <h1 className={styles.headline}>Begin Your Echo</h1>
      <p className={styles.helper}>Enter 3-6 strengths, passions, or qualities</p>

      <input
        className={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a trait then press Enter…"
        onKeyDown={(e) => e.key === "Enter" && addTrait()}
      />

      <button onClick={addTrait} className={styles.addBtn}>
        Add
      </button>

      {draft.length > 0 && (
        <>
          <ul className={styles.list}>
            {draft.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <button
            onClick={() => onSubmit(draft)}
            className={styles.discoverBtn}
          >
            Discover
          </button>
        </>
      )}
    </div>
  );
}
