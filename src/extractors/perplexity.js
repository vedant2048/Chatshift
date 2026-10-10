// src/extractors/perplexity.js

(function () {
  try {
    const title = document.title || 'Perplexity Thread';
    const messageNodes = document.querySelectorAll('.message, [data-testid="thread-item"], .default');
    const messages = [];

    messageNodes.forEach(node => {
      let role = 'assistant';
      if (node.classList.contains('user') || node.querySelector('.user') || node.getAttribute('data-author') === 'user') {
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
      conversation: { platform: 'Perplexity', title, messages }
    });
  } catch (err) {
    chrome.runtime.sendMessage({
      type: 'extracted',
      success: false,
      error: `Perplexity extraction error: ${err.message}`
    });
  }
})();
