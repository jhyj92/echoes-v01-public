// utils/codexManager.js

/**
 * Flat & Tree‐based Codex manager for Echoes
 */

/** ─── FLAT LIST STORAGE ──────────────────────────────────────────────── */
const FLAT_KEY = "echoes_codex_flat";

/** Load all flat Codex entries. */
export function loadCodexFlat() {
  try {
    return JSON.parse(localStorage.getItem(FLAT_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Add a new flat Codex entry.
 * @param {{ content: string }} param0
 */
export function addCodexFlat({ content }) {
  const list = loadCodexFlat();
  list.push({ content, ts: Date.now() });
  localStorage.setItem(FLAT_KEY, JSON.stringify(list));
}


/** ─── TREE STORAGE ──────────────────────────────────────────────────── */
const TREE_KEY = "echoes_codex_tree";

/** Load the tree‐structured Codex. */
export function loadCodexTree() {
  try {
    return JSON.parse(localStorage.getItem(TREE_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Initialize a Codex tree given the discovered superpower.
 * @param {string} superpower
 * @returns {Array} new root array
 */
export function initCodexTree(superpower) {
  const root = { title: `Superpower • ${superpower}`, children: [] };
  localStorage.setItem(TREE_KEY, JSON.stringify([root]));
  return [root];
}

/**
 * Add a new branch under the specified path in the Codex tree.
 * @param {number[]} path – array of child‐indexes to traverse
 * @param {string} title  – new branch title
 */
export function addCodexBranch(path = [], title) {
  let tree = loadCodexTree();
  if (!tree.length) return;

  // navigate to parent node
  let node = tree[0];
  for (const idx of path) {
    node = node.children?.[idx];
    if (!node) return;
  }

  // append new child
  node.children = node.children || [];
  node.children.push({ title, children: [] });
  localStorage.setItem(TREE_KEY, JSON.stringify(tree));
}
