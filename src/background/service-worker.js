// src/background/service-worker.js
import { formatText } from '../formatter/text.js';
import { formatJson } from '../formatter/json.js';

// Ensure side panel opens when clicking the extension icon
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onInstalled.addListener(() => {
  // Panel behavior configured globally
});

/**
 * Helper to identify platform from URL
 */
function getPlatformFromUrl(urlString) {
  if (!urlString) return null;
  try {
    const url = new URL(urlString);
    const host = url.hostname.toLowerCase();
    if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) {
      return { key: 'chatgpt', name: 'ChatGPT' };
    }
    if (host.includes('claude.ai')) {
      return { key: 'claude', name: 'Claude' };
    }
    if (host.includes('gemini.google.com')) {
      return { key: 'gemini', name: 'Gemini' };
    }
    if (host.includes('perplexity.ai')) {
      return { key: 'perplexity', name: 'Perplexity' };
    }
  } catch (e) {
    return null;
  }
  return null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'detectSource') {
    chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
      const tab = tabs[0];
      if (!tab || !tab.url) {
        sendResponse({ success: false, error: 'Cannot access active tab' });
        return;
      }

      const platformInfo = getPlatformFromUrl(tab.url);
      if (!platformInfo) {
        sendResponse({ success: false, error: 'SOURCE NOT SUPPORTED' });
        return;
      }

      // Try a fast DOM check to get initial message count and title
      let detectedCount = 0;
      let pageTitle = tab.title || '';

      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const titleEl = document.querySelector('h1, h2, .title');
            const title = titleEl ? titleEl.innerText.trim() : (document.title || '');
            let count = 0;
            // Count messages for various platforms
            const chatgptTurns = document.querySelectorAll('[data-message-author-role], article');
            const claudeTurns = document.querySelectorAll('[data-testid="message"]');
            const geminiTurns = document.querySelectorAll('[data-message-role], message-content');
            const perplexityTurns = document.querySelectorAll('.message, [data-testid="thread-item"]');

            count = chatgptTurns.length || claudeTurns.length || geminiTurns.length || perplexityTurns.length || 0;
            return { title, count };
          }
        });

        if (results && results[0] && results[0].result) {
          detectedCount = results[0].result.count || 0;
          if (results[0].result.title) pageTitle = results[0].result.title;
        }
      } catch (err) {
        // Tab might be restricted or still loading; proceed with basic detection
      }

      sendResponse({
        success: true,
        platform: platformInfo.name,
        title: pageTitle,
        messageCount: detectedCount
      });
    });
    return true; // Keep message channel open
  }

  if (message.type === 'extractConversation') {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0];
      if (!tab || !tab.url) {
        sendResponse({ success: false, error: 'No active tab accessible' });
        return;
      }

      const platformInfo = getPlatformFromUrl(tab.url);
      if (!platformInfo) {
        sendResponse({ success: false, error: 'SOURCE NOT SUPPORTED' });
        return;
      }

      let responded = false;
      const timeoutId = setTimeout(() => {
        if (!responded) {
          responded = true;
          chrome.runtime.onMessage.removeListener(listener);
          sendResponse({ success: false, error: 'Extraction timed out' });
        }
      }, 10000);

      const listener = (msg, senderTab) => {
        if (msg.type === 'extracted') {
          if (!responded) {
            responded = true;
            clearTimeout(timeoutId);
            chrome.runtime.onMessage.removeListener(listener);
            if (msg.success !== false && msg.conversation) {
              sendResponse({ success: true, conversation: msg.conversation });
            } else {
              sendResponse({ success: false, error: msg.error || 'Failed to extract conversation' });
            }
          }
        }
      };

      chrome.runtime.onMessage.addListener(listener);

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [`src/extractors/${platformInfo.key}.js`]
      }).catch(err => {
        if (!responded) {
          responded = true;
          clearTimeout(timeoutId);
          chrome.runtime.onMessage.removeListener(listener);
          sendResponse({ success: false, error: `Script injection failed: ${err.message}` });
        }
      });
    });
    return true;
  }

  if (message.type === 'formatConversation') {
    const { format, conversation } = message;
    try {
      if (!conversation) {
        sendResponse({ success: false, error: 'No conversation provided for formatting' });
        return true;
      }
      let result = '';
      if (format === 'txt') {
        result = formatText(conversation);
      } else if (format === 'json') {
        result = formatJson(conversation);
      } else {
        sendResponse({ success: false, error: `Unsupported format: ${format}` });
        return true;
      }
      sendResponse({ success: true, result });
    } catch (err) {
      sendResponse({ success: false, error: `Formatting error: ${err.message}` });
    }
    return true;
  }

  if (message.type === 'transferConversation') {
    const { target, conversation } = message;
    chrome.storage.session.set({ conversation }, () => {
      const normalized = (target || '').toLowerCase();
      let url = null;
      switch (normalized) {
        case 'chatgpt':
          url = 'https://chatgpt.com/';
          break;
        case 'claude':
          url = 'https://claude.ai/';
          break;
        case 'gemini':
          url = 'https://gemini.google.com/app';
          break;
        case 'perplexity':
          url = 'https://www.perplexity.ai/';
          break;
        default:
          sendResponse({ success: false, error: `Unsupported target platform: ${target}` });
          return;
      }

      chrome.tabs.create({ url }, newTab => {
        let responded = false;
        const transferTimeout = setTimeout(() => {
          if (!responded) {
            responded = true;
            sendResponse({ success: false, error: 'Auto-insertion timed out in target tab' });
          }
        }, 20000);

        const tabUpdateListener = (tabId, info) => {
          if (tabId === newTab.id && info.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(tabUpdateListener);

            // Wait a brief moment for dynamic web app to initialize before injecting
            setTimeout(() => {
              const respListener = (msg) => {
                if (msg.type === 'transferResult') {
                  if (!responded) {
                    responded = true;
                    clearTimeout(transferTimeout);
                    chrome.runtime.onMessage.removeListener(respListener);
                    sendResponse({ success: msg.success, error: msg.error });
                  }
                }
              };
              chrome.runtime.onMessage.addListener(respListener);

              chrome.scripting.executeScript({
                target: { tabId: newTab.id },
                files: [`src/transfer/${normalized}.js`]
              }).catch(err => {
                if (!responded) {
                  responded = true;
                  clearTimeout(transferTimeout);
                  chrome.runtime.onMessage.removeListener(respListener);
                  sendResponse({ success: false, error: `Injection failed in target tab: ${err.message}` });
                }
              });
            }, 1000);
          }
        };

        chrome.tabs.onUpdated.addListener(tabUpdateListener);
      });
    });
    return true;
  }
});
