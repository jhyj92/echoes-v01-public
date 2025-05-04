export interface CodexNode {
  id: string;
  label: string;
  children?: CodexNode[];
  ts?: number; // timestamp
  note?: string; // user note
}

const CODEX_KEY = "echoes_codex_tree";

// Helper: Find journey branch by domain, hero, and superpower
function findJourneyBranch(tree: CodexNode[], domain: string, hero: string, superpower: string): CodexNode | null {
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

  // Try to find an existing journey branch
  let journey = findJourneyBranch(tree, domain, hero, superpower);

  if (!journey) {
    // Create a new journey branch
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

  // Find the hero node under this journey
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

  // Add the new reflection letter as a new child under the hero node
  const letterNode: CodexNode = {
    id: `${id}-letter-${Date.now()}`,
    label: "Reflection Letter",
    ts: timestamp,
    note,
    children: [
      {
        id: `${id}-letter-content-${Date.now()}`,
        label: letter,
        ts: timestamp,
      },
    ],
  };

  heroNode.children = heroNode.children || [];
  heroNode.children.push(letterNode);

  saveCodexTree(tree);
}

// Edit a node’s note or label by id
export function editCodexNode(id: string, newLabel?: string, newNote?: string) {
  const tree = loadCodexTree();
  function editNode(nodes: CodexNode[]) {
    for (const node of nodes) {
      if (node.id === id) {
        if (newLabel !== undefined) node.label = newLabel;
        if (newNote !== undefined) node.note = newNote;
        return true;
      }
      if (node.children && editNode(node.children)) return true;
    }
    return false;
  }
  editNode(tree);
  saveCodexTree(tree);
}

// Delete a node (and its children) by id
export function deleteCodexNode(id: string) {
  let changed = false;
  function removeNode(nodes: CodexNode[]): CodexNode[] {
    return nodes.filter(node => {
      if (node.id === id) {
        changed = true;
        return false;
      }
      if (node.children) node.children = removeNode(node.children);
      return true;
    });
  }
  const tree = loadCodexTree();
  const newTree = removeNode(tree);
  if (changed) saveCodexTree(newTree);
}
