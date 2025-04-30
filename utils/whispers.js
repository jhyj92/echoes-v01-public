// utils/whispers.js

/**
 * A rotating pool of hidden poetic lore seeds.
 */
export const whispers = [
  "Stars remember the wishes we forget.",
  "Silence is the doorway every echo passes through.",
  "Dreams are maps written in ink that fades by dawn.",
  "Courage sometimes hides in questions, not answers.",
  "The universe leans closer when you whisper back."
];

/**
 * Pick one whisper at random.
 */
export function randomWhisper() {
  const idx = Math.floor(Math.random() * whispers.length);
  return whispers[idx];
}
