// src/transfer/claude.js

// Transfer script to insert formatted conversation into Claude input (never auto-sends)
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
      const target = document.querySelector('div[contenteditable="true"]') ||
                     document.querySelector('.ProseMirror') ||
                     document.querySelector('fieldset textarea') ||
                     document.querySelector('textarea');

      if (target) {
        target.focus();
        if (target.tagName.toLowerCase() === 'textarea') {
          target.value = textToInsert;
          target.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          // Contenteditable
          target.innerText = textToInsert;
          target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
        }
        chrome.runtime.sendMessage({ type: 'transferResult', success: true });
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(tryInsert, 500);
      } else {
        chrome.runtime.sendMessage({
          type: 'transferResult',
          success: false,
          error: 'Could not locate Claude prompt input. Context is copied to clipboard.'
        });
      }
    };

    tryInsert();
  } catch (err) {
    chrome.runtime.sendMessage({
      type: 'transferResult',
      success: false,
      error: `Claude transfer failed: ${err.message}`
    });
  }
})();
