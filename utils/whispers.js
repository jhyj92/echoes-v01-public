/**
 * Hidden poetic "whispers" that can be triggered in the UI.
 * Used to provide subtle atmospheric feedback or inspiration.
 */
const WHISPERS = Object.freeze([
  "A soft echo stirs beneath the waves...",
  "Listen closely-your heart knows the way.",
  "Shadows shift; a new path whispers your name.",
  "In the hush, the world speaks back to you.",
  "Every breath carries a hidden refrain."
]);

/**
 * Returns a random whisper from the pool.
 * @param exclude Optional array of whispers to exclude.
 * @returns A random whisper string.
 */
export function getRandomWhisper(exclude: string[] = []): string {
  const available = WHISPERS.filter(w => !exclude.includes(w));
  const pool = available.length > 0 ? available : WHISPERS;
  return pool[Math.floor(Math.random() * pool.length)];
}
