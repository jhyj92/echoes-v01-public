/* ---- flat list (hero letters, phrases) ---- */
export function addCodex({ content }) {
  const key = "echoes_codex_flat";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.push({ content, ts: Date.now() });
  localStorage.setItem(key, JSON.stringify(list));
}
export function loadCodexFlat() {
  return JSON.parse(localStorage.getItem("echoes_codex_flat") || "[]");
}

/* ---- tree structure ---- */
export function loadCodexTree() {
  return JSON.parse(localStorage.getItem("echoes_codex_tree") || "[]");
}
export async function initCodex(superpower) {
  const root = { title: `Superpower • ${superpower}`, children: [] };
  localStorage.setItem("echoes_codex_tree", JSON.stringify([root]));
  return [root];
}
export function addCodexBranch(path, title) {
  const tree = loadCodexTree();
  let node = tree[0];
  path.forEach((i) => (node = node.children[i]));
  node.children = node.children || [];
  node.children.push({ title, children: [] });
  localStorage.setItem("echoes_codex_tree", JSON.stringify(tree));
}
