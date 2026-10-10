// src/transfer/chatgpt.js

// Transfer script to insert formatted conversation into ChatGPT input (never auto-sends)
(async () => {
  try {
    const { conversation } = await chrome.storage.session.get(['conversation']);
    if (!conversation) {
      chrome.runtime.sendMessage({ type: 'transferResult', success: false, error: 'No conversation in session storage' });
      return;
    }

    const textToInsert = conversation.formatted || conversation.formattedText || conversation.formattedJson || '';
    if (!textToInsert) {
      chrome.runtime.sendMessage({ type: 'transferResult', success: false, error: 'No formatted text to insert' });
      return;
    }

    let retries = 0;
    const maxRetries = 20;

    const tryInsert = () => {
      // ChatGPT input selectors: #prompt-textarea, contenteditable div, or textarea
      const target = document.querySelector('#prompt-textarea') ||
                     document.querySelector('textarea[data-id="root"]') ||
                     document.querySelector('div[contenteditable="true"]') ||
                     document.querySelector('textarea');

      if (target) {
        target.focus();
        if (target.tagName.toLowerCase() === 'textarea') {
          target.value = textToInsert;
          target.dispatchEvent(new Event('input', { bubbles: true }));
          target.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          // contenteditable element
          target.innerText = textToInsert;
          target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
        }
        // Note: NEVER automatically click Send
        chrome.runtime.sendMessage({ type: 'transferResult', success: true });
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(tryInsert, 500);
      } else {
        chrome.runtime.sendMessage({
          type: 'transferResult',
          success: false,
          error: 'Could not locate ChatGPT prompt input. Context is copied to clipboard.'
        });
      }
    };

    tryInsert();
  } catch (err) {
    chrome.runtime.sendMessage({
      type: 'transferResult',
      success: false,
      error: `ChatGPT transfer failed: ${err.message}`
    });
  }
})();
