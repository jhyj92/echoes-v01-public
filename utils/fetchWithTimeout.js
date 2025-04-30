// utils/fetchWithTimeout.js
export default function fetchWithTimeout(url, options={}, ms=8000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, rej) => setTimeout(()=>rej(new Error("timeout")), ms))
  ]);
}
