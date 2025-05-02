// utils/generateCodexEntry.js
/**
 * Creates a new Codex entry via the LLM endpoint
 */
export async function generateCodexEntry(superpower, contextEvents) {
  const res = await fetch("/api/superpower", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain: superpower, guideAnswers: contextEvents }),
  });
  const { superpower: sp, description } = await res.json();
  return { title: sp, content: description };
}
