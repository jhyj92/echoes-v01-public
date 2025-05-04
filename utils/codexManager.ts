export interface CodexNode {
  id: string;
  label: string;
  children?: CodexNode[];
  ts?: number; // timestamp
}

const CODEX_KEY = "echoes_codex_tree";

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

export function saveCodexTree(tree: CodexNode[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CODEX_KEY, JSON.stringify(tree));
  } catch {
    // Handle error if needed
  }
}

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
