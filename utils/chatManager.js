// utils/chatManager.js
/**
 * Client‐side wrappers for all Echoes LLM API routes
 */
export async function extractTraits(text) {
  const res = await fetch("/api/extractTraits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const { traits } = await res.json();
  return traits;
}

export async function suggestDomains(answers) {
  const res = await fetch("/api/domains", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  const { suggestions } = await res.json();
  return suggestions;
}

export async function nextGuideQuestion(domain, answersSoFar) {
  const res = await fetch("/api/guideQuestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain, answersSoFar }),
  });
  const { question, done } = await res.json();
  return { question, done };
}

export async function revealSuperpower(domain, guideAnswers) {
  const res = await fetch("/api/superpower", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain, guideAnswers }),
  });
  const { superpower, description } = await res.json();
  return { superpower, description };
}

export async function heroChat(superpower, heroName, history) {
  const res = await fetch("/api/heroChat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ superpower, heroName, history }),
  });
  const { reply, done } = await res.json();
  return { reply, done };
}

export async function getReflectionLetter(heroName, superpower, history) {
  const res = await fetch("/api/reflectionLetter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ heroName, superpower, history }),
  });
  const { letter } = await res.json();
  return letter;
}
