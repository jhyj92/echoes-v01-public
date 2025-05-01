// utils/codexManager.js

/**
 * Add a new flat Codex entry.
 * @param {{ content: string }} param0
 */
export function addCodex({ content }) {
  const key = "echoes_codex_flat";
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    list = [];
  }
  list.push({ content, ts: Date.now() });
  localStorage.setItem(key, JSON.stringify(list));
}

/** Load all flat Codex entries. */
export function loadCodexFlat() {
  try {
    return JSON.parse(localStorage.getItem("echoes_codex_flat") || "[]");
  } catch {
    return [];
  }
}

/** Load the tree-structured Codex. */
export function loadCodexTree() {
  try {
    return JSON.parse(localStorage.getItem("echoes_codex_tree") || "[]");
  } catch {
    return [];
  }
}

/**
 * Initialize a Codex tree given the discovered superpower.
 * Returns the new root node array.
 */
export async function initCodex(superpower) {
  const root = { title: `Superpower • ${superpower}`, children: [] };
  localStorage.setItem("echoes_codex_tree", JSON.stringify([root]));
  return [root];
}

/**
 * Add a new branch under the specified path in the Codex tree.
 * @param {number[]} path – array of indexes to the parent node
 * @param {string} title  – new branch title
 */
export function addCodexBranch(path = [], title) {
  const key = "echoes_codex_tree";
  let tree = [];
  try {
    tree = JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return;
  }
  let node = tree[0];
  for (const idx of path) {
    node = (node.children || [])[idx];
    if (!node) return;
  }
  node.children = node.children || [];
  node.children.push({ title, children: [] });
  localStorage.setItem(key, JSON.stringify(tree));
}
