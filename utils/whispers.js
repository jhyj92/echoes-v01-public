// utils/whispers.js

export const whispers = [
  "Stars remember the wishes we forget.",
  "Silence is the doorway every echo passes through.",
  "Dreams are maps written in ink that fades by dawn.",
  "Courage sometimes hides in questions, not answers.",
  "The universe leans closer when you whisper back."
];

export function randomWhisper() {
  const idx = Math.floor(Math.random() * whispers.length);
  return whispers[idx];
}
