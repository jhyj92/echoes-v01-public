// components/CodexTree.tsx
"use client";

import React from "react";

export interface CodexEntry {
  title: string;
  children?: CodexEntry[];
}

interface EntryProps {
  node: CodexEntry;
}

function Entry({ node }: EntryProps) {
  return (
    <li className="mb-2">
      <span className="font-serif text-gold">{node.title}</span>
      {node.children && node.children.length > 0 && (
        <ul className="ml-4 list-disc">
          {node.children.map((child, idx) => (
            <Entry key={idx} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

interface CodexTreeProps {
  tree: CodexEntry[];
}

export default function CodexTree({ tree }: CodexTreeProps) {
  return (
    <div className="p-8 max-w-2xl mx-auto prose prose-invert">
      <h2 className="font-serif text-2xl mb-4">Your Codex</h2>
      <ul>
        {tree.map((node, idx) => (
          <Entry key={idx} node={node} />
        ))}
      </ul>
    </div>
  );
}
