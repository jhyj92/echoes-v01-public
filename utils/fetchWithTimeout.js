// utils/fetchWithTimeout.js

/**
 * Perform a fetch but abort if it takes longer than `timeout` ms.
 * Returns the fetch Response or throws on timeout/network error.
 */
export default async function fetchWithTimeout(
  url,
  options = {},
  timeout = 15_000
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}
