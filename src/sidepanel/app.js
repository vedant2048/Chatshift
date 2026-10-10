// src/sidepanel/app.js
// ChatShift — AI Conversation Transfer Chrome Side Panel

const STATE = {
  DETECTING: 'detecting',
  READY: 'ready',
  COPYING: 'copying',
  TRANSFER: 'transfer',
  TRANSFERRING: 'transferring',
  SUCCESS: 'success',
  ERROR: 'error'
};

let currentState = STATE.DETECTING;
let statePayload = {};

let conversation = {
  platform: '',
  title: '',
  domain: '',
  messages: [],
  sizeKb: '0.0',
  formattedText: '',
  formattedJson: ''
};

let selectedFormat = 'txt'; // 'txt' | 'json'

const appDiv = document.getElementById('app');

/* ==========================================================================
   SVG ICON DEFINITIONS
   ========================================================================== */
const ICONS = {
  logo: `<svg viewBox="0 0 1000 1000" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 330 180 L 260 140 L 400 140 L 780 230 L 840 290 L 620 510 L 560 450 L 600 410 L 720 290 L 430 220 Z" fill="#FFFFFF"/>
    <path d="M 670 820 L 740 860 L 600 860 L 220 770 L 160 710 L 380 490 L 440 550 L 400 590 L 280 710 L 570 780 Z" fill="#FFD23F"/>
  </svg>`,

  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>`,

  chatgpt: `<svg viewBox="0 0 24 24" width="24" height="24" fill="#10A37F">
    <path d="M22.28 9.37a5.99 5.99 0 0 0-.52-4.95 6.09 6.09 0 0 0-6.41-2.8 6.09 6.09 0 0 0-4.67-2.12c-2.4 0-4.52 1.41-5.48 3.5a6.08 6.08 0 0 0-3.9 2.83 6.09 6.09 0 0 0 .74 6.96 6.07 6.07 0 0 0 .52 4.95 6.09 6.09 0 0 0 6.41 2.8 6.09 6.09 0 0 0 4.67 2.12c2.4 0 4.52-1.41 5.48-3.5a6.08 6.08 0 0 0 3.9-2.83 6.09 6.09 0 0 0-.74-6.96zm-9.33 12.38a4.2 4.2 0 0 1-2.65-.95l.13-.08 4.4-2.54a.97.97 0 0 0 .49-.84v-6.2l1.86 1.07a.12.12 0 0 1 .06.09v5.25a4.26 4.26 0 0 1-4.29 4.26zm-7.94-3.77a4.24 4.24 0 0 1-.58-2.76c.03-.33.1-.66.22-.97l.13.08 4.4 2.54c.26.15.58.15.84 0l5.37-3.1v2.15c0 .07-.03.14-.08.17l-4.55 2.63a4.26 4.26 0 0 1-5.75-.84zm-1.61-8.52a4.2 4.2 0 0 1 2.07-1.81v5.17a.97.97 0 0 0 .49.84l5.37 3.1-1.86 1.07a.12.12 0 0 1-.12 0l-4.55-2.63a4.26 4.26 0 0 1-1.4-5.74zm13.1 1.76l-5.37-3.1 1.86-1.07a.12.12 0 0 1 .12 0l4.55 2.63a4.26 4.26 0 0 1 1.4 5.74 4.2 4.2 0 0 1-2.07 1.81v-5.17a.97.97 0 0 0-.49-.84zm2.19-3.08c-.03.33-.1.66-.22.97l-.13-.08-4.4-2.54a.97.97 0 0 0-.84 0l-5.37 3.1V8.34c0-.07.03-.14.08-.17l4.55-2.63a4.26 4.26 0 0 1 6.33 3.6zm-8.87-2.92a4.2 4.2 0 0 1 2.65.95l-.13.08-4.4 2.54a.97.97 0 0 0-.49.84v6.2l-1.86-1.07a.12.12 0 0 1-.06-.09V7.48a4.26 4.26 0 0 1 4.29-4.26z"/>
  </svg>`,

  claude: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none">
    <rect width="24" height="24" rx="4" fill="#D97757"/>
    <text x="12" y="16.5" font-family="'Inter', sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">Ai</text>
  </svg>`,

  gemini: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none">
    <path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" fill="url(#geminiGrad)"/>
    <defs>
      <linearGradient id="geminiGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stop-color="#4E75FF"/>
        <stop offset="1" stop-color="#B668F6"/>
      </linearGradient>
    </defs>
  </svg>`,

  perplexity: `<svg viewBox="0 0 24 24" width="24" height="24" fill="#20B2AA">
    <circle cx="12" cy="12" r="3" fill="#20B2AA"/>
    <circle cx="12" cy="4.5" r="1.8" fill="#20B2AA"/>
    <circle cx="17.3" cy="6.7" r="1.8" fill="#20B2AA"/>
    <circle cx="19.5" cy="12" r="1.8" fill="#20B2AA"/>
    <circle cx="17.3" cy="17.3" r="1.8" fill="#20B2AA"/>
    <circle cx="12" cy="19.5" r="1.8" fill="#20B2AA"/>
    <circle cx="6.7" cy="17.3" r="1.8" fill="#20B2AA"/>
    <circle cx="4.5" cy="12" r="1.8" fill="#20B2AA"/>
    <circle cx="6.7" cy="6.7" r="1.8" fill="#20B2AA"/>
  </svg>`,

  chatBubble: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>`,

  fileText: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
  </svg>`,

  txtDoc: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>`,

  jsonCode: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 3H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2"></path>
    <path d="M16 21h2a2 2 0 0 0 2-2v-4a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-2"></path>
  </svg>`,

  download: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>`,

  shield: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>`,

  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>`,

  arrowRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>`,

  backArrow: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>`,

  home: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>`
};

/* ==========================================================================
   STATE MANAGEMENT
   ========================================================================== */
function setState(newState, payload = {}) {
  currentState = newState;
  statePayload = payload;
  render();
}

/**
 * Robust messaging wrapper for chrome.runtime.sendMessage
 */
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, response => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response);
      });
    } catch (err) {
      reject(err);
    }
  });
}

function render() {
  if (!appDiv) return;
  appDiv.innerHTML = '';

  switch (currentState) {
    case STATE.DETECTING:
      renderDetecting();
      break;
    case STATE.READY:
      renderReady();
      break;
    case STATE.COPYING:
      renderCopying();
      break;
    case STATE.TRANSFER:
      renderTransfer();
      break;
    case STATE.TRANSFERRING:
      renderTransferring();
      break;
    case STATE.SUCCESS:
      renderSuccess();
      break;
    case STATE.ERROR:
      renderError();
      break;
    default:
      renderError({ msg: `Unknown state: ${currentState}` });
  }
}

/* ==========================================================================
   TOP HEADER COMPONENT (Shared across screens)
   ========================================================================== */
function createHeader(showSubtitle = true) {
  const header = document.createElement('div');

  const topBar = document.createElement('div');
  topBar.className = 'header-bar';

  const brand = document.createElement('div');
  brand.className = 'brand-wrapper';

  const logoWrap = document.createElement('div');
  logoWrap.className = 'brand-logo';
  logoWrap.innerHTML = ICONS.logo;

  const brandText = document.createElement('span');
  brandText.className = 'brand-text';
  brandText.innerHTML = `CHAT<span class="shift-yellow">SHIFT</span>`;

  brand.appendChild(logoWrap);
  brand.appendChild(brandText);

  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'settings-btn';
  settingsBtn.setAttribute('title', 'Settings');
  settingsBtn.innerHTML = ICONS.settings;
  settingsBtn.addEventListener('click', () => {
    alert('ChatShift v1.0\nSecure AI conversation transfer utility.\nData remains 100% on your local device.');
  });

  topBar.appendChild(brand);
  topBar.appendChild(settingsBtn);
  header.appendChild(topBar);

  if (showSubtitle) {
    const subtitle = document.createElement('div');
    subtitle.className = 'subtitle-badge';
    subtitle.textContent = 'AI CONVERSATION TRANSFER';
    header.appendChild(subtitle);
  }

  return header;
}

/* ==========================================================================
   STATE 1: DETECTING
   ========================================================================== */
async function renderDetecting() {
  appDiv.appendChild(createHeader(true));

  const stateBox = document.createElement('div');
  stateBox.className = 'state-container';
  stateBox.innerHTML = `
    <div class="state-spinner"></div>
    <div class="state-text">DETECTING CONVERSATION...</div>
  `;
  appDiv.appendChild(stateBox);

  try {
    const response = await sendMessage({ type: 'detectSource' });
    if (response && response.success !== false && response.platform) {
      conversation.platform = response.platform;
      conversation.title = response.title || '';

      // Determine domain based on platform
      const pLow = response.platform.toLowerCase();
      if (pLow.includes('chatgpt')) conversation.domain = 'chat.openai.com';
      else if (pLow.includes('claude')) conversation.domain = 'claude.ai';
      else if (pLow.includes('gemini')) conversation.domain = 'gemini.google.com';
      else if (pLow.includes('perplexity')) conversation.domain = 'perplexity.ai';
      else conversation.domain = 'detected platform';

      const count = response.messageCount !== undefined ? response.messageCount : 0;
      conversation.messages = new Array(count).fill({});
      conversation.sizeKb = count > 0 ? (count * 0.52).toFixed(1) : '0.0';

      setState(STATE.READY);
    } else {
      const errorMsg = (response && response.error) ? response.error : 'SOURCE NOT SUPPORTED';
      setState(STATE.ERROR, { msg: errorMsg });
    }
  } catch (err) {
    console.error('ChatShift initialization failed:', err);
    setState(STATE.ERROR, { msg: err.message || 'Could not connect to active tab' });
  }
}

/* ==========================================================================
   STATE 2: READY (Screen 1 from Reference)
   ========================================================================== */
function renderReady() {
  appDiv.appendChild(createHeader(true));

  // 1. SOURCE LABEL
  const sourceLabel = document.createElement('div');
  sourceLabel.className = 'section-label';
  sourceLabel.textContent = 'SOURCE';
  appDiv.appendChild(sourceLabel);

  // 2. SOURCE CARD
  const sourceCard = document.createElement('div');
  sourceCard.className = 'source-card';

  const sourceLeft = document.createElement('div');
  sourceLeft.className = 'source-left';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'platform-icon-wrap';
  const pKey = (conversation.platform || '').toLowerCase();
  iconWrap.innerHTML = ICONS[pKey] || ICONS.chatgpt;

  const sourceMeta = document.createElement('div');
  sourceMeta.className = 'source-meta';
  const nameEl = document.createElement('div');
  nameEl.className = 'source-name';
  nameEl.textContent = conversation.platform || 'ChatGPT';
  const domainEl = document.createElement('div');
  domainEl.className = 'source-domain';
  domainEl.textContent = conversation.domain || 'chat.openai.com';
  sourceMeta.appendChild(nameEl);
  sourceMeta.appendChild(domainEl);

  sourceLeft.appendChild(iconWrap);
  sourceLeft.appendChild(sourceMeta);

  const statusBadge = document.createElement('div');
  statusBadge.className = 'status-badge detected';
  statusBadge.innerHTML = `<span class="status-dot"></span> DETECTED`;

  sourceCard.appendChild(sourceLeft);
  sourceCard.appendChild(statusBadge);
  appDiv.appendChild(sourceCard);

  // 3. METRICS GRID (Messages + Size)
  const metricsGrid = document.createElement('div');
  metricsGrid.className = 'metrics-grid';

  const msgCount = conversation.messages.length || 0;
  const sizeVal = conversation.sizeKb || '0.0';

  metricsGrid.innerHTML = `
    <div class="metric-card">
      <div class="metric-top">
        <span class="metric-icon">${ICONS.chatBubble}</span>
        <span class="metric-value">${msgCount}</span>
      </div>
      <div class="metric-label">MESSAGES</div>
    </div>
    <div class="metric-card">
      <div class="metric-top">
        <span class="metric-icon">${ICONS.fileText}</span>
        <span class="metric-value">${sizeVal} <span style="font-size:12px;font-weight:600;">KB</span></span>
      </div>
      <div class="metric-label">CONVERSATION SIZE</div>
    </div>
  `;
  appDiv.appendChild(metricsGrid);

  // 4. PRIMARY CTA: COPY PROMPT ->
  const copyBtn = document.createElement('button');
  copyBtn.className = 'primary-cta-btn';
  copyBtn.innerHTML = `
    <span class="corner-tl">┌</span>
    <span class="corner-tr">┐</span>
    <span>COPY PROMPT</span>
    ${ICONS.arrowRight}
    <span class="corner-bl">└</span>
    <span class="corner-br">┘</span>
  `;
  copyBtn.addEventListener('click', onCopyClick);
  appDiv.appendChild(copyBtn);

  // 5. SAVE FORMAT SECTION
  const formatLabel = document.createElement('div');
  formatLabel.className = 'section-label';
  formatLabel.textContent = 'SAVE FORMAT';
  appDiv.appendChild(formatLabel);

  const formatGrid = document.createElement('div');
  formatGrid.className = 'format-grid';

  // TXT Format Card
  const txtCard = document.createElement('div');
  txtCard.className = `format-btn ${selectedFormat === 'txt' ? 'selected' : ''}`;
  txtCard.innerHTML = `
    <div class="format-icon">${ICONS.txtDoc}</div>
    <div class="format-label">TXT</div>
    <div class="selected-badge"><span class="selected-badge-check">✓</span></div>
  `;
  txtCard.addEventListener('click', () => {
    selectedFormat = 'txt';
    txtCard.classList.add('selected');
    jsonCard.classList.remove('selected');
  });

  // JSON Format Card
  const jsonCard = document.createElement('div');
  jsonCard.className = `format-btn ${selectedFormat === 'json' ? 'selected' : ''}`;
  jsonCard.innerHTML = `
    <div class="format-icon">${ICONS.jsonCode}</div>
    <div class="format-label">JSON</div>
    <div class="selected-badge"><span class="selected-badge-check">✓</span></div>
  `;
  jsonCard.addEventListener('click', () => {
    selectedFormat = 'json';
    jsonCard.classList.add('selected');
    txtCard.classList.remove('selected');
  });

  formatGrid.appendChild(txtCard);
  formatGrid.appendChild(jsonCard);
  appDiv.appendChild(formatGrid);

  // 6. FOOTER
  const footer = document.createElement('div');
  footer.className = 'footer-note';
  footer.innerHTML = `
    <span class="footer-shield-icon">${ICONS.shield}</span>
    <span>Your data stays on your device.<br>No tracking. No servers.</span>
  `;
  appDiv.appendChild(footer);
}

/* ==========================================================================
   FORMATTING HELPER
   ========================================================================== */
async function formatConversation(conv, fmt) {
  const resp = await sendMessage({
    type: 'formatConversation',
    format: fmt,
    conversation: conv
  });

  if (resp && resp.success !== false && resp.result !== undefined) {
    return resp.result;
  }
  throw new Error((resp && resp.error) ? resp.error : `Failed to format conversation as ${fmt.toUpperCase()}`);
}

/* ==========================================================================
   ON COPY PROMPT CLICK
   ========================================================================== */
async function onCopyClick() {
  setState(STATE.COPYING);

  try {
    const resp = await sendMessage({ type: 'extractConversation' });

    if (!resp || resp.success === false) {
      throw new Error((resp && resp.error) ? resp.error : 'EXTRACTION FAILED');
    }

    if (!resp.conversation || !Array.isArray(resp.conversation.messages)) {
      throw new Error('Malformed conversation data received from extractor');
    }

    if (resp.conversation.messages.length === 0) {
      throw new Error('NO CONVERSATION DETECTED ON CURRENT PAGE');
    }

    // Update conversation state
    conversation.platform = resp.conversation.platform || conversation.platform || 'ChatGPT';
    conversation.title = resp.conversation.title || '';
    conversation.messages = resp.conversation.messages;

    // Format TXT and JSON
    try {
      conversation.formattedText = await formatConversation(resp.conversation, 'txt');
    } catch (e) {
      console.error('Format TXT failed:', e);
      conversation.formattedText = '';
    }

    try {
      conversation.formattedJson = await formatConversation(resp.conversation, 'json');
    } catch (e) {
      console.error('Format JSON failed:', e);
      conversation.formattedJson = JSON.stringify(resp.conversation, null, 2);
    }

    // Accurate size calculation
    const content = selectedFormat === 'json' ? conversation.formattedJson : conversation.formattedText;
    const bytes = new Blob([content]).size;
    conversation.sizeKb = (bytes / 1024).toFixed(1);

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(content);
    } catch (clipErr) {
      console.error('Clipboard write error:', clipErr);
      throw new Error(`COPY FAILED: ${clipErr.message}`);
    }

    setState(STATE.TRANSFER);
  } catch (err) {
    console.error('ChatShift extraction failed:', err);
    setState(STATE.ERROR, { msg: err.message || 'EXTRACTION FAILED' });
  }
}

/* ==========================================================================
   STATE 3: COPYING
   ========================================================================== */
function renderCopying() {
  appDiv.appendChild(createHeader(true));

  const stateBox = document.createElement('div');
  stateBox.className = 'state-container';
  stateBox.innerHTML = `
    <div class="state-spinner"></div>
    <div class="state-text">EXTRACTING & FORMATTING CONTEXT...</div>
  `;
  appDiv.appendChild(stateBox);
}

/* ==========================================================================
   STATE 4: TRANSFER (Screen 2 from Reference)
   ========================================================================== */
function renderTransfer() {
  appDiv.appendChild(createHeader(false));

  // 1. SUCCESS BANNER
  const banner = document.createElement('div');
  banner.className = 'success-banner';
  banner.innerHTML = `${ICONS.check} <span>CONTEXT COPIED TO CLIPBOARD</span>`;
  appDiv.appendChild(banner);

  // 2. TRANSFER TO LABEL
  const transferLabel = document.createElement('div');
  transferLabel.className = 'section-label';
  transferLabel.textContent = 'TRANSFER TO';
  appDiv.appendChild(transferLabel);

  // 3. 2x2 LLM DESTINATIONS GRID
  const destGrid = document.createElement('div');
  destGrid.className = 'destinations-grid';

  const platforms = [
    { key: 'chatgpt', name: 'CHATGPT', domain: 'chat.openai.com', icon: ICONS.chatgpt },
    { key: 'claude', name: 'CLAUDE', domain: 'claude.ai', icon: ICONS.claude },
    { key: 'gemini', name: 'GEMINI', domain: 'gemini.google.com', icon: ICONS.gemini },
    { key: 'perplexity', name: 'PERPLEXITY', domain: 'perplexity.ai', icon: ICONS.perplexity }
  ];

  platforms.forEach(p => {
    const card = document.createElement('div');
    card.className = 'destination-card';
    card.innerHTML = `
      <div class="dest-icon-wrap">${p.icon}</div>
      <div class="dest-title">${p.name}</div>
      <div class="dest-domain">${p.domain}</div>
    `;
    card.addEventListener('click', () => onDestinationSelect(p.name));
    destGrid.appendChild(card);
  });
  appDiv.appendChild(destGrid);

  // 4. DEVICE SECTION
  const deviceLabel = document.createElement('div');
  deviceLabel.className = 'section-label';
  deviceLabel.textContent = 'DEVICE';
  appDiv.appendChild(deviceLabel);

  const deviceCard = document.createElement('div');
  deviceCard.className = 'device-card';
  deviceCard.innerHTML = `
    <div class="device-icon">${ICONS.download}</div>
    <div class="device-info">
      <div class="device-title">DOWNLOAD CONTEXT</div>
      <div class="device-sub">Save as ${selectedFormat.toUpperCase()}</div>
    </div>
  `;
  deviceCard.addEventListener('click', onDownloadClick);
  appDiv.appendChild(deviceCard);

  // 5. BOTTOM NAVIGATION BAR (BACK / HOME)
  const bottomNav = document.createElement('div');
  bottomNav.className = 'bottom-nav';

  const backBtn = document.createElement('button');
  backBtn.className = 'nav-btn';
  backBtn.innerHTML = `${ICONS.backArrow} BACK`;
  backBtn.addEventListener('click', () => setState(STATE.READY));

  const homeBtn = document.createElement('button');
  homeBtn.className = 'nav-btn';
  homeBtn.innerHTML = `${ICONS.home} HOME`;
  homeBtn.addEventListener('click', () => setState(STATE.DETECTING));

  bottomNav.appendChild(backBtn);
  bottomNav.appendChild(homeBtn);
  appDiv.appendChild(bottomNav);
}

/* ==========================================================================
   DOWNLOAD HANDLER
   ========================================================================== */
function onDownloadClick() {
  try {
    const isTxt = selectedFormat === 'txt';
    const content = isTxt ? conversation.formattedText : conversation.formattedJson;

    if (!content) {
      setState(STATE.ERROR, { msg: 'NO FORMATTED DATA AVAILABLE TO DOWNLOAD' });
      return;
    }

    const filename = isTxt ? 'chatshift-conversation.txt' : 'chatshift-conversation.json';
    const mime = isTxt ? 'text/plain' : 'application/json';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({ url, filename, saveAs: true }, downloadId => {
      URL.revokeObjectURL(url);
      if (chrome.runtime.lastError) {
        console.error('Download failed:', chrome.runtime.lastError);
        setState(STATE.ERROR, { msg: `DOWNLOAD FAILED: ${chrome.runtime.lastError.message}` });
      }
    });
  } catch (err) {
    console.error('Download exception:', err);
    setState(STATE.ERROR, { msg: `DOWNLOAD ERROR: ${err.message}` });
  }
}

/* ==========================================================================
   DESTINATION TRANSFER HANDLER
   ========================================================================== */
async function onDestinationSelect(platformName) {
  if (!conversation || !conversation.messages || conversation.messages.length === 0) {
    setState(STATE.ERROR, { msg: 'NO CONVERSATION AVAILABLE FOR TRANSFER' });
    return;
  }

  setState(STATE.TRANSFERRING);

  try {
    const formattedContent = selectedFormat === 'json' ? conversation.formattedJson : conversation.formattedText;
    const resp = await sendMessage({
      type: 'transferConversation',
      target: platformName,
      conversation: {
        platform: conversation.platform,
        title: conversation.title,
        messages: conversation.messages,
        formatted: formattedContent,
        formattedText: conversation.formattedText,
        formattedJson: conversation.formattedJson
      }
    });

    if (resp && resp.success) {
      setState(STATE.SUCCESS);
    } else {
      const errorMsg = (resp && resp.error)
        ? `AUTO INSERT FAILED: ${resp.error}\n\nYour context has already been copied to your clipboard. You can manually paste (Ctrl+V) it into the target LLM.`
        : 'AUTO INSERT FAILED.\n\nYour context has already been copied to your clipboard. You can manually paste (Ctrl+V) it into the target LLM.';
      setState(STATE.ERROR, { msg: errorMsg });
    }
  } catch (err) {
    console.error('Transfer failed:', err);
    setState(STATE.ERROR, { msg: `TRANSFER ERROR: ${err.message}\n\nYour context has already been copied to your clipboard.` });
  }
}

/* ==========================================================================
   STATE 5: TRANSFERRING
   ========================================================================== */
function renderTransferring() {
  appDiv.appendChild(createHeader(false));

  const stateBox = document.createElement('div');
  stateBox.className = 'state-container';
  stateBox.innerHTML = `
    <div class="state-spinner"></div>
    <div class="state-text">OPENING TARGET LLM & PREPARING CONTEXT...</div>
  `;
  appDiv.appendChild(stateBox);
}

/* ==========================================================================
   STATE 6: SUCCESS
   ========================================================================== */
function renderSuccess() {
  appDiv.appendChild(createHeader(false));

  const banner = document.createElement('div');
  banner.className = 'success-banner';
  banner.innerHTML = `${ICONS.check} <span>TRANSFER COMPLETE — CONTEXT PREPARED</span>`;
  appDiv.appendChild(banner);

  const card = document.createElement('div');
  card.className = 'metric-card';
  card.style.margin = '20px 0';
  card.innerHTML = `
    <div style="font-size:13px;color:var(--text-primary);line-height:1.6;">
      Context successfully inserted into the target LLM composer.<br><br>
      <strong>ChatShift never auto-sends messages.</strong> Review the context in the new tab and press Send when ready.
    </div>
  `;
  appDiv.appendChild(card);

  const bottomNav = document.createElement('div');
  bottomNav.className = 'bottom-nav';

  const backBtn = document.createElement('button');
  backBtn.className = 'nav-btn';
  backBtn.innerHTML = `${ICONS.backArrow} BACK TO TRANSFER`;
  backBtn.addEventListener('click', () => setState(STATE.TRANSFER));

  const homeBtn = document.createElement('button');
  homeBtn.className = 'nav-btn';
  homeBtn.innerHTML = `${ICONS.home} HOME`;
  homeBtn.addEventListener('click', () => setState(STATE.DETECTING));

  bottomNav.appendChild(backBtn);
  bottomNav.appendChild(homeBtn);
  appDiv.appendChild(bottomNav);
}

/* ==========================================================================
   STATE 7: ERROR
   ========================================================================== */
function renderError(payload) {
  appDiv.appendChild(createHeader(true));

  const currentMsg = (payload && payload.msg) || statePayload.msg || 'UNKNOWN ERROR OCCURRED';

  const errorCard = document.createElement('div');
  errorCard.className = 'error-card';
  errorCard.innerHTML = `
    <div class="error-title">SYSTEM STATUS / ERROR</div>
    <div class="error-body">${currentMsg}</div>
  `;
  appDiv.appendChild(errorCard);

  const retryBtn = document.createElement('button');
  retryBtn.className = 'retry-btn';
  retryBtn.innerHTML = `↻ RETRY DETECTION`;
  retryBtn.addEventListener('click', () => {
    setState(STATE.DETECTING);
  });
  appDiv.appendChild(retryBtn);

  const footer = document.createElement('div');
  footer.className = 'footer-note';
  footer.innerHTML = `
    <span class="footer-shield-icon">${ICONS.shield}</span>
    <span>Supported platforms: ChatGPT, Claude, Gemini, Perplexity.</span>
  `;
  appDiv.appendChild(footer);
}

/* ==========================================================================
   SAFE INITIALIZATION
   ========================================================================== */
function init() {
  try {
    setState(STATE.DETECTING);
  } catch (err) {
    console.error('ChatShift initialization failed:', err);
    renderError({ msg: `INITIALIZATION EXCEPTION: ${err.message}` });
  }
}

init();
