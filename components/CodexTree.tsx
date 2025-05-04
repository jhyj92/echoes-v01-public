"use client";
import { useState } from "react";

export interface CodexNode {
  id: string;
  label: string;
  children?: CodexNode[];
}

interface CodexTreeProps {
  tree: CodexNode[];
}

export default function CodexTree({ tree }: CodexTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderNode = (entry: CodexNode) => {
    const hasChildren = entry.children && entry.children.length > 0;
    const isExpanded = expanded.has(entry.id);

    return (
      <li key={entry.id}>
        <button
          type="button"
          onClick={() => hasChildren && toggle(entry.id)}
          className="text-left text-gold hover:text-white transition"
        >
          {hasChildren && (
            <span className="mr-2">{isExpanded ? "▾" : "▸"}</span>
          )}
          {entry.label}
        </button>
        {hasChildren && isExpanded && (
          <ul className="ml-6 mt-2 space-y-1">
            {entry.children!.map(renderNode)}
          </ul>
        )}
      </li>
    );
  };

  if (!tree || tree.length === 0) {
    return <p className="italic text-gold">No journeys found in your Codex yet.</p>;
  }

  return <ul className="space-y-2">{tree.map(renderNode)}</ul>;
}
