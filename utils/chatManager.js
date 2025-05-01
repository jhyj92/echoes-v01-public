// utils/chatManager.js

/**
 * Load the chat history array from localStorage,
 * returning an empty array on error or missing.
 */
export function loadChat() {
  try {
    return JSON.parse(localStorage.getItem("echoes_chat") || "[]");
  } catch {
    return [];
  }
}

/**
 * Persist the chat history array.
 */
export function saveChat(history = []) {
  try {
    localStorage.setItem("echoes_chat", JSON.stringify(history));
  } catch (e) {
    console.warn("Failed to save chat history", e);
  }
}
