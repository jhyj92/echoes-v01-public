/**
 * Codex Manager for Echoes (tree-based)
 */

export interface CodexNode {
  id: string;
  label: string;
  children?: CodexNode[];
  ts?: number; // timestamp
}

const CODEX_KEY = "echoes_codex_tree";

/**
 * Load the Codex tree from localStorage.
 * Returns an empty array if none found or on error.
 */
export function loadCodexTree(): CodexNode[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CODEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CodexNode[];
  } catch {
    return [];
  }
}

/**
 * Save the Codex tree to localStorage.
 * @param tree The Codex tree to save.
 */
export function saveCodexTree(tree: CodexNode[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CODEX_KEY, JSON.stringify(tree));
  } catch {
    // Optionally handle storage errors here
  }
}

/**
 * Add a new journey entry to the Codex tree.
 * The journey includes domain, hero, and reflection letter content.
 * @param params Object containing domain, hero, and letter.
 */
export function addCodexJourney({
  domain,
  hero,
  letter,
}: {
  domain: string;
  hero: string;
  letter: string;
}): void {
  const tree = loadCodexTree();
  const timestamp = Date.now();
  const id = `journey-${timestamp}`;

  // Construct the hierarchical entry
  const entry: CodexNode = {
    id,
    label: `Domain: ${domain}`,
    ts: timestamp,
    children: [
      {
        id: `${id}-hero`,
        label: `Hero: ${hero}`,
        ts: timestamp,
        children: [
          {
            id: `${id}-letter`,
            label: "Reflection Letter",
            ts: timestamp,
            children: [
              {
                id: `${id}-letter-content`,
                label: letter,
                ts: timestamp,
              },
            ],
          },
        ],
      },
    ],
  };

  tree.push(entry);
  saveCodexTree(tree);
}
