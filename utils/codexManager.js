// utils/codexManager.js

/* ---------- tree helpers ---------- */
export function loadCodexTree() {
  return JSON.parse(localStorage.getItem("echoes_codex_tree") || "[]");
}

export async function initCodex(superpower) {
  // (stub summary to avoid extra API call during build)
  const root = { title: `Superpower • ${superpower}`, children: [] };
  localStorage.setItem("echoes_codex_tree", JSON.stringify([root]));
  return [root];
}

export function addCodexBranch(path, title) {
  const tree = loadCodexTree();
  // locate node via path & push a child
  let node = tree[0];
  path.forEach((idx) => (node = node.children[idx]));
  node.children = node.children || [];
  node.children.push({ title, children: [] });
  localStorage.setItem("echoes_codex_tree", JSON.stringify(tree));
}

/* ---------- flat list helpers ---------- */
export function addCodex({ content }) {
  const key = "echoes_codex_flat";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push({ content, timestamp: Date.now() });
  localStorage.setItem(key, JSON.stringify(existing));
}

export function loadCodexFlat() {
  return JSON.parse(localStorage.getItem("echoes_codex_flat") || "[]");
}
