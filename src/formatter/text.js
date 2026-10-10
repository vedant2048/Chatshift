// src/formatter/text.js
export function formatText(conversation) {
  if (!conversation) return '';
  const { title, messages } = conversation;
  let output = '';
  if (title) output += `# ${title}\n\n`;
  if (Array.isArray(messages)) {
    messages.forEach(msg => {
      const roleLabel = msg.role === 'assistant' ? 'Assistant' : 'User';
      output += `## ${roleLabel}\n${msg.content || ''}\n\n`;
    });
  }
  return output.trim();
}
