/**
 * Codex Manager for Echoes (tree-based)
 */
export interface CodexNode {
  id: string;
  label: string;
  children?: CodexNode[];
  ts?: number;
}

const CODEX_KEY = "echoes_codex_tree";

/** Load the Codex tree from localStorage. */
export function loadCodexTree(): CodexNode[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CODEX_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Save the Codex tree to localStorage. */
export function saveCodexTree(tree: CodexNode[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CODEX_KEY, JSON.stringify(tree));
}

/** Add a new journey to the Codex tree. */
export function addCodexJourney({
  domain,
  hero,
  letter,
}: {
  domain: string;
  hero: string;
  letter: string;
}) {
  const tree = loadCodexTree();
  const id = `journey-${Date.now()}`;
  const entry: CodexNode = {
    id,
    label: `Domain: ${domain}`,
    ts: Date.now(),
    children: [
      {
        id: `${id}-hero`,
        label: `Hero: ${hero}`,
        children: [
          {
            id: `${id}-letter`,
            label: "Reflection Letter",
            children: [],
            ts: Date.now(),
          },
        ],
        ts: Date.now(),
      },
    ],
  };
  // Attach the letter as the deepest child
  entry.children![0].children![0].children = [
    { id: `${id}-letter-content`, label: letter, ts: Date.now() },
  ];

  tree.push(entry);
  saveCodexTree(tree);
}
