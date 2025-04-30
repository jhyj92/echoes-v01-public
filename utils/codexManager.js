// utils/codexManager.js

export function loadCodexTree() {
  return JSON.parse(localStorage.getItem("echoes_codex_tree")||"[]");
}

export async function initCodex(superpower) {
  const prompt = `Summarize this superpower: "${superpower}" in a poetic title and subtitle.`;
  // fetch summary via API (similar to others)…
  const title="Superpower Title"; const subtitle="Poetic subtitle";
  const root = { title:`${title}: ${subtitle}`, children:[] };
  localStorage.setItem("echoes_codex_tree", JSON.stringify([root]));
  return [root];
}

export function addCodexBranch(path, title) {
  const tree = loadCodexTree();
  // navigate path and push child… (omitted for brevity)
  // then save…
  localStorage.setItem("echoes_codex_tree", JSON.stringify(tree));
}
