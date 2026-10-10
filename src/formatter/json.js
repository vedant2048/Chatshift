// src/formatter/json.js
export function formatJson(conversation) {
  if (!conversation) return '{}';
  return JSON.stringify(conversation, null, 2);
}
