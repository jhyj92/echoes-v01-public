// utils/generateCodexEntry.js
// Creates a poetic codex line after major events.
export default function generateCodexEntry(world, traits) {
  const core = traits.slice(0, 3).join(', ');
  return `In the ${world}, the echoes recognise your ${core}.`;
}
