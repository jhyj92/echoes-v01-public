// components/CodexTree.js
"use client";

import React from "react";

/**
 * Recursive <ul>/<li> renderer for the Codex.
 * Each entry is assumed to have:
 *   - title  : string
 *   - children?: CodexEntry[]
 */
function Entry({ node }) {
  return (
    <li className="mb-2">
      <span className="font-serif text-gold">{node.title}</span>
      {node.children?.length ? (
        <ul className="ml-6 list-disc marker:text-gold/70">
          {node.children.map((child, i) => (
            <Entry key={i} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * Root Codex tree component
 *
 * @param {{ entries: CodexEntry[] }} props
 */
export default function CodexTree({ entries: tree }) {
  if (!tree?.length) {
    return (
      <p className="text-center text-gold/70">
        Your Codex is still blank… <br /> Begin a journey to let it grow.
      </p>
    );
  }

  return (
    <ul className="prose prose-invert">
      {tree.map((node, i) => (
        <Entry key={i} node={node} />
      ))}
    </ul>
  );
}
