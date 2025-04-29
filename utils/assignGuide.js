// utils/assignGuide.js
// Very light v0.2 mapping: dominant domain ➜ guide archetype
// In v0.3 you’ll expand this list + add weighted logic.

const GUIDE_MAP = {
  creativity: "The Dreamweaver",
  analysis: "The Strategist",
  courage: "The Guardian",
  curiosity: "The Seeker",
};

export default function assignGuide(domain) {
  return GUIDE_MAP[domain] || "The Wanderer";
}
