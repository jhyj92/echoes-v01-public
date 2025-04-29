// components/TraitForm.js
"use client";

import { useState } from 'react';

export default function TraitForm({ onSubmit }) {
  const [input, setInput] = useState('');
  const [draft, setDraft] = useState([]);

  function addTrait() {
    if (!input.trim()) return;
    setDraft([...draft, input.trim()]);
    setInput('');
  }

  return (
    <div className="trait-form">
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type a strength (enter to add)…"
        onKeyDown={e => e.key === 'Enter' && addTrait()}
      />
      <button onClick={addTrait}>Add</button>

      {!!draft.length && (
        <>
          <ul>{draft.map(t => <li key={t}>{t}</li>)}</ul>
          <button onClick={() => onSubmit(draft)}>Find My World</button>
        </>
      )}
    </div>
  );
}
