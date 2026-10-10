// src/extractors/claude.js

(function () {
  try {
    const titleEl = document.querySelector('h1, .header-title');
    const title = titleEl ? titleEl.innerText.trim() : (document.title || 'Claude Conversation');

    const messageNodes = document.querySelectorAll('[data-testid="message"], .font-claude-message');
    const messages = [];

    messageNodes.forEach(node => {
      let role = 'assistant';
      if (node.classList.contains('user') || node.querySelector('.user') || node.getAttribute('data-is-human') === 'true') {
        role = 'user';
      }

      const contentNode = node.querySelector('[data-testid="message-content"]') ||
                          node.querySelector('.grid-cols-1') ||
                          node;

      const content = contentNode.innerText.trim();
      if (content) {
        messages.push({ role, content });
      }
    });

    chrome.runtime.sendMessage({
      type: 'extracted',
      success: true,
      conversation: { platform: 'Claude', title, messages }
    });
  } catch (err) {
    chrome.runtime.sendMessage({
      type: 'extracted',
      success: false,
      error: `Claude extraction error: ${err.message}`
    });
  }
})();
