// utils/interviewerManager.js

/**
 * Client-side helper to fetch the next interview question
 * from our secure Next.js API route.
 * @param {string[]} history – previous user/assistant messages
 * @returns {Promise<string>} – the next question text
 */
export async function askNext(history = []) {
  // We send just the latest user answer to keep payload minimal.
  const lastAnswer = history.length
    ? history[history.length - 1]
    : "";

  const res = await fetch("/api/interviewer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: lastAnswer })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Interviewer API error");
  }

  const { question } = await res.json();
  return question;
}
