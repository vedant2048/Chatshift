// src/extractors/chatgpt.js

(function () {
  try {
    const titleEl = document.querySelector('h1, h2, .title');
    const title = titleEl ? titleEl.innerText.trim() : (document.title || 'ChatGPT Conversation');

    // ChatGPT turns are represented by elements with data-message-author-role or articles
    let nodes = document.querySelectorAll('[data-message-author-role]');
    if (!nodes || nodes.length === 0) {
      nodes = document.querySelectorAll('article');
    }

    const messages = [];

    nodes.forEach(node => {
      let role = node.getAttribute('data-message-author-role');
      if (!role) {
        if (node.querySelector('[data-message-author-role="user"]') || node.querySelector('.user') || node.classList.contains('user')) {
          role = 'user';
        } else if (node.querySelector('[data-message-author-role="assistant"]') || node.querySelector('.assistant') || node.classList.contains('assistant')) {
          role = 'assistant';
        } else {
          // Default based on turn index or context
          role = messages.length % 2 === 0 ? 'user' : 'assistant';
        }
      }

      // Content selector: markdown container or conversation turn or fallback
      const contentEl = node.querySelector('.markdown') ||
                        node.querySelector('div[data-testid="conversation-turn"]') ||
                        node.querySelector('div.whitespace-pre-wrap') ||
                        node;

      const content = contentEl.innerText.trim();
      if (content) {
        messages.push({
          role: role === 'assistant' ? 'assistant' : 'user',
          content
        });
      }
    });

    chrome.runtime.sendMessage({
      type: 'extracted',
      success: true,
      conversation: {
        platform: 'ChatGPT',
        title,
        messages
      }
    });
  } catch (err) {
    chrome.runtime.sendMessage({
      type: 'extracted',
      success: false,
      error: `ChatGPT extraction failed: ${err.message}`
    });
  }
})();
