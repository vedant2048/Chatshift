// src/extractors/gemini.js

(function () {
  try {
    const titleEl = document.querySelector('h1, .title, .conversation-title');
    const title = titleEl ? titleEl.innerText.trim() : (document.title || 'Gemini Conversation');

    const messageNodes = document.querySelectorAll('[data-message-role], message-content, .user-query, .model-response');
    const messages = [];

    messageNodes.forEach(node => {
      let role = 'assistant';
      const roleAttr = node.getAttribute('data-message-role');
      if (roleAttr) {
        role = roleAttr === 'assistant' || roleAttr === 'model' ? 'assistant' : 'user';
      } else if (node.tagName.toLowerCase() === 'user-query' || node.classList.contains('user-query')) {
        role = 'user';
      }

      const content = node.innerText.trim();
      if (content) {
        messages.push({ role, content });
      }
    });

    chrome.runtime.sendMessage({
      type: 'extracted',
      success: true,
      conversation: { platform: 'Gemini', title, messages }
    });
  } catch (err) {
    chrome.runtime.sendMessage({
      type: 'extracted',
      success: false,
      error: `Gemini extraction error: ${err.message}`
    });
  }
})();
