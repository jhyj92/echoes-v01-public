"use client";

import { useState, KeyboardEvent } from "react";
import { editCodexNode, deleteCodexNode, loadCodexTree, CodexNode } from "@/utils/codexManager";

interface CodexTreeProps {
  tree: CodexNode[];
  refresh?: () => void; // callback to reload tree after edit/delete
}

export default function CodexTree({ tree, refresh }: CodexTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState<string>("");

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    id: string,
    hasChildren: boolean
  ) => {
    if (!hasChildren) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(id);
    }
  };

  const handleEdit = (node: CodexNode) => {
    setEditingId(node.id);
    setEditNote(node.note || "");
  };

  const handleEditSave = (id: string) => {
    editCodexNode(id, undefined, editNote);
    setEditingId(null);
    setEditNote("");
    if (refresh) refresh();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this entry and all its children?")) {
      deleteCodexNode(id);
      if (refresh) refresh();
    }
  };

  const renderNode = (entry: CodexNode) => {
    const hasChildren = !!(entry.children && entry.children.length > 0);
    const isExpanded = expanded.has(entry.id);

    return (
      <li key={entry.id} className="mb-2">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => hasChildren && toggle(entry.id)}
            onKeyDown={(e) => handleKeyDown(e, entry.id, hasChildren)}
            className="text-left text-gold hover:text-white transition focus:outline-none focus:ring-2 focus:ring-gold rounded"
            aria-expanded={isExpanded}
            aria-controls={`${entry.id}-children`}
          >
            {hasChildren && (
              <span className="mr-2 select-none">{isExpanded ? "▾" : "▸"}</span>
            )}
            {entry.label}
          </button>
          {entry.ts && (
            <span className="ml-2 text-xs text-gold/50">
              ({new Date(entry.ts).toLocaleString()})
            </span>
          )}
          <button
            onClick={() => handleEdit(entry)}
            className="ml-2 text-xs text-blue-300 underline"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(entry.id)}
            className="ml-2 text-xs text-red-400 underline"
          >
            Delete
          </button>
        </div>
        {editingId === entry.id ? (
          <div className="ml-6 mt-2">
            <input
              type="text"
              value={editNote}
              onChange={e => setEditNote(e.target.value)}
              className="w-full rounded bg-transparent border border-gold/40 px-3 py-2"
              placeholder="Edit note…"
            />
            <button
              onClick={() => handleEditSave(entry.id)}
              className="btn-primary mt-1"
            >
              Save
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="btn-secondary mt-1 ml-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          entry.note && (
            <div className="ml-6 italic text-gold/80">{entry.note}</div>
          )
        )}
        {hasChildren && isExpanded && (
          <ul id={`${entry.id}-children`} className="ml-6 mt-2 space-y-1">
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
