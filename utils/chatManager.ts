export interface ChatMessage {
  from: "user" | "hero";
  text: string;
}

const HISTORY_KEY_PREFIX = "echoes_history_";

/**
 * Load chat history for a given scenario.
 * @param scenario Scenario identifier string.
 * @returns ChatMessage[]
 */
export function loadHistory(scenario: string): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const key = HISTORY_KEY_PREFIX + scenario;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

/**
 * Save chat history for a given scenario.
 * @param scenario Scenario identifier string.
 * @param messages Array of chat messages.
 */
export function saveHistory(scenario: string, messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;

  try {
    const key = HISTORY_KEY_PREFIX + scenario;
    localStorage.setItem(key, JSON.stringify(messages));
  } catch {
    // Ignore write errors
  }
}
