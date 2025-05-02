// utils/chatManager.js

export interface ChatMessage {
  from: "user" | "hero";
  text: string;
}

const HISTORY_KEY_PREFIX = "echoes_history_";

/**
 * Load chat history for a given scenario.
 * @param {string} scenario
 * @returns {ChatMessage[]}
 */
export function loadHistory(scenario: string): ChatMessage[] {
  try {
    const key = HISTORY_KEY_PREFIX + scenario;
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    return raw as ChatMessage[];
  } catch {
    return [];
  }
}

/**
 * Save chat history for a given scenario.
 * @param {string} scenario
 * @param {ChatMessage[]} messages
 */
export function saveHistory(scenario: string, messages: ChatMessage[]): void {
  try {
    const key = HISTORY_KEY_PREFIX + scenario;
    localStorage.setItem(key, JSON.stringify(messages));
  } catch {
    // ignore
  }
}
