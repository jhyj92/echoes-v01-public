// utils/chatManager.js

/**
 * Chat history manager for Echoes HeroChat conversations.
 * Persists per-scenario conversation arrays in localStorage.
 */

const HISTORY_KEY_PREFIX = "echoes_history_";

/**
 * Load chat history for a given scenario.
 * @param {string} scenario
 * @returns {{ from: string, text: string }[]}
 */
export function loadHistory(scenario) {
  try {
    const key = HISTORY_KEY_PREFIX + scenario;
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

/**
 * Save chat history for a given scenario.
 * @param {string} scenario
 * @param {{ from: string, text: string }[]} messages
 */
export function saveHistory(scenario, messages) {
  try {
    const key = HISTORY_KEY_PREFIX + scenario;
    localStorage.setItem(key, JSON.stringify(messages));
  } catch {
    // ignore
  }
}
