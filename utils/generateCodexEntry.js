// utils/generateCodexEntry.js

/**
 * Creates a new Codex entry via the LLM endpoint
 */
export async function generateCodexEntry(domain, contextEvents) {
  const res = await fetch("/api/superpower", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain, guideAnswers: contextEvents }),
  });

  if (!res.ok) {
    return { title: "Unknown Power", content: "The echoes returned no insight." };
  }

  const { superpower, description } = await res.json();
  return { title: superpower, content: description };
}
