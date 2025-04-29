// utils/assignWorld.js
// Returns a world name given an ordered list of dominant traits.
export default function assignWorld(traits) {
  const t = traits.map(t => t.toLowerCase());

  if (t.includes('creativity') || t.includes('imagination'))
    return 'Dream-Sea Realm';

  if (t.includes('strategy') || t.includes('analysis'))
    return 'Crystalline Labyrinth';

  if (t.includes('empathy') || t.includes('compassion'))
    return 'Verdant Veil';

  if (t.includes('courage') || t.includes('grit'))
    return 'Emberwake Highlands';

  // default fallback
  return 'Shifting Echo Fields';
}
