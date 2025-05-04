// utils/codexManager.ts

export interface CodexNode {
  id: string;
  label: string;
  children?: CodexNode[];
  ts?: number; // timestamp
  note?: string; // user note
}

const CODEX_KEY = "echoes_codex_tree";

/**
 * Helper: Find a journey branch by domain, hero, and superpower.
 * Returns the journey node or null if not found.
 */
function findJourneyBranch(
  tree: CodexNode[],
  domain: string,
  hero: string,
  superpower: string
): CodexNode | null {
  for (const journey of tree) {
    if (
      journey.label === `Domain: ${domain}` &&
      journey.children &&
      journey.children[0]?.label === `Superpower: ${superpower}` &&
      journey.children[0]?.children &&
      journey.children[0].children[0]?.label === `Hero: ${hero}`
    ) {
      return journey;
    }
  }
  return null;
}

/**
 * Load the codex tree from localStorage.
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
 * Save the codex tree to localStorage.
 */
export function saveCodexTree(tree: CodexNode[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CODEX_KEY, JSON.stringify(tree));
  } catch {
    // Optionally handle error (e.g., quota exceeded)
  }
}

/**
 * Add a new journey with domain, hero, superpower, letter, and optional note.
 * Creates the journey branch if it does not exist.
 */
export function addCodexJourney({
  domain,
  hero,
  superpower,
  letter,
  note,
}: {
  domain: string;
  hero: string;
  superpower: string;
  letter: string;
  note?: string;
}): void {
  const tree = loadCodexTree();
  const timestamp = Date.now();
  const id = `journey-${timestamp}`;

  // Find existing journey branch or create a new one
  let journey = findJourneyBranch(tree, domain, hero, superpower);

  if (!journey) {
    journey = {
      id,
      label: `Domain: ${domain}`,
      ts: timestamp,
      children: [
        {
          id: `${id}-superpower`,
          label: `Superpower: ${superpower}`,
          ts: timestamp,
          children: [
            {
              id: `${id}-hero`,
              label: `Hero: ${hero}`,
              ts: timestamp,
              children: [],
            },
          ],
        },
      ],
    };
    tree.push(journey);
  }

  // Find or create the hero node under the superpower node
  const superpowerNode = journey.children?.find(
    (c) => c.label === `Superpower: ${superpower}`
  );
  let heroNode = superpowerNode?.children?.find(
    (c) => c.label === `Hero: ${hero}`
  );
  if (!heroNode) {
    heroNode = {
      id: `${id}-hero`,
      label: `Hero: ${hero}`,
      ts: timestamp,
      children: [],
    };
    superpowerNode?.children?.push(heroNode);
  }

  // Add the new reflection letter as a child of the hero node
  const letterTimestamp = Date.now();
  const letterNode: CodexNode = {
    id: `${id}-letter-${letterTimestamp}`,
    label: "Reflection Letter",
    ts: letterTimestamp,
    note,
    children: [
      {
        id: `${id}-letter-content-${letterTimestamp}`,
        label: letter,
        ts: letterTimestamp,
      },
    ],
  };

  heroNode.children = heroNode.children || [];
  heroNode.children.push(letterNode);

  saveCodexTree(tree);
}

/**
 * Edit a node’s label and/or note by id.
 * Saves the updated tree if the node was found and edited.
 */
export function editCodexNode(
  id: string,
  newLabel?: string,
  newNote?: string
): void {
  const tree = loadCodexTree();

  function editNode(nodes: CodexNode[]): boolean {
    for (const node of nodes) {
      if (node.id === id) {
        if (newLabel !== undefined) node.label = newLabel;
        if (newNote !== undefined) node.note = newNote;
        node.ts = Date.now();
        return true;
      }
      if (node.children && editNode(node.children)) return true;
    }
    return false;
  }

  if (editNode(tree)) {
    saveCodexTree(tree);
  }
}

/**
 * Delete a node (and all its children) by id.
 * Saves the updated tree if a node was removed.
 */
export function deleteCodexNode(id: string): void {
  let changed = false;

  function removeNode(nodes: CodexNode[]): CodexNode[] {
    return nodes.filter((node) => {
      if (node.id === id) {
        changed = true;
        return false;
      }
      if (node.children) {
        node.children = removeNode(node.children);
      }
      return true;
    });
  }

  const tree = loadCodexTree();
  const newTree = removeNode(tree);

  if (changed) {
    saveCodexTree(newTree);
  }
}
