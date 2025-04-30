// utils/interviewerManager.js
/**
 * (Optional) Any logic to store in-progress Q&A in session/localStorage
 */
export function saveInterview(answers) {
  localStorage.setItem("echoes_interview", JSON.stringify(answers));
}
export function loadInterview() {
  return JSON.parse(localStorage.getItem("echoes_interview")||"[]");
}
