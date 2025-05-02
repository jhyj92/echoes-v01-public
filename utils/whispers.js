// utils/whispers.js
/**
 * Hidden poetic "whispers" that can be triggered in the UI
 */
const pool = [
  "A soft echo stirs beneath the waves...",
  "Listen closely—your heart knows the way.",
  "Shadows shift; a new path whispers your name.",
  "In the hush, the world speaks back to you.",
  "Every breath carries a hidden refrain."
];

export function getRandomWhisper() {
  return pool[Math.floor(Math.random() * pool.length)];
}
