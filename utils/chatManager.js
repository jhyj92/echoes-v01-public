// utils/chatManager.js
/**
 * Manage persisting chat history across reloads
 */
export function loadChat() {
  return JSON.parse(localStorage.getItem("echoes_chat")||"[]");
}
export function saveChat(history) {
  localStorage.setItem("echoes_chat", JSON.stringify(history));
}
