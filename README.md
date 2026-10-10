# ChatShift — AI Conversation Transfer

> **Seamlessly extract and transfer full multi-turn AI conversations between ChatGPT, Claude, Gemini, and Perplexity with a single click.**

![Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen.svg)
![Platform](https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge%20%7C%20Brave-blue.svg)
![Type](https://img.shields.io/badge/UI-Side%20Panel-orange.svg)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local%20%2F%20Client--Side-success.svg)

---

## 📖 Overview

**ChatShift** is a Chrome Side Panel extension built with **Manifest V3**. It solves the friction of moving between different Large Language Models (LLMs). When you start a brainstorm or debugging session in one AI and want to continue, compare, or double-check with another AI, you no longer need to copy and paste back and forth manually.

ChatShift automatically captures the entire thread context (user prompts, AI responses, code snippets, lists, and tables), formats it cleanly, and transfers it into another LLM tab or exports it locally.

### ✨ Key Features

- **⚡ Instant Auto-Detection**: Automatically detects open conversation threads on supported AI web platforms.
- **🔄 1-Click LLM Transfer**: Opens destination platform (ChatGPT, Claude, Gemini, Perplexity) with context pre-inserted into the message input.
- **🛡️ Safe Pre-Fill (No Auto-Send)**: Context is placed into the composer for your review before sending. You stay in control.
- **📋 Dual Export Formats**:
  - **Clean Markdown (`TXT`)**: Beautiful, human-readable dialogue transcripts with role headers and fenced code blocks.
  - **Structured JSON (`JSON`)**: Structured object array containing roles, timestamps, message metadata, and source URLs.
- **📎 Clipboard Copy**: Copies conversation transcripts directly to your clipboard with a single click.
- **💾 Local Device Download**: Save logs directly to your computer as `.txt` or `.json` files.
- **🔒 100% Client-Side Privacy**: Zero servers, zero external API dependencies, and zero tracking. All processing occurs locally in your browser.

---

## 🌐 Supported Platforms

| Platform | Supported Domains | Source Extraction | Transfer Target |
| :--- | :--- | :---: | :---: |
| **OpenAI ChatGPT** | `chatgpt.com`, `chat.openai.com` | ✅ | ✅ |
| **Anthropic Claude** | `claude.ai` | ✅ | ✅ |
| **Google Gemini** | `gemini.google.com` | ✅ | ✅ |
| **Perplexity AI** | `perplexity.ai` | ✅ | ✅ |

---

## 🛠️ Developer Method: How to Install & Load the Extension

You do not need to download this from the Chrome Web Store to run or develop it. You can load it directly into Google Chrome (or any Chromium browser like Microsoft Edge, Brave, Opera, or Arc) using **Developer Mode**.

### Step 1: Locate the Extension Folder
Ensure you have the extension files on your computer. The folder containing [`manifest.json`](file:///d:/Code/Chrome%20Extensions/Chatshift/manifest.json) is:
```text
d:\Code\Chrome Extensions\Chatshift
```

### Step 2: Open Extensions Management in Chrome
1. Launch **Google Chrome**.
2. In the address bar, type:
   ```text
   chrome://extensions
   ```
   *(For Microsoft Edge, use `edge://extensions`; for Brave, use `brave://extensions`)*
3. Press **Enter**.

### Step 3: Enable Developer Mode
In the top-right corner of the Extensions page, find the **Developer mode** toggle switch and turn it **ON**:

```text
[ Developer mode ]  ⚪ ──▶ 🟢 (ON)
```

Once enabled, three buttons will appear in the top-left toolbar:
- **Load unpacked**
- **Pack extension**
- **Update**

### Step 4: Click "Load unpacked"
1. Click the **Load unpacked** button.
2. In the folder picker dialog that opens, navigate to and select the **`Chatshift`** folder:
   ```text
   d:\Code\Chrome Extensions\Chatshift
   ```
   *(Make sure to select the folder that directly contains `manifest.json`, not a parent directory.)*
3. Click **Select Folder**.

### Step 5: Verify the Extension is Active
You will now see the **ChatShift** card in your extensions list:
- **Name**: ChatShift
- **Version**: 1.0 (or current version)
- **ID**: An auto-generated 32-character string
- **Errors**: Should be blank (no error button)

### Step 6: Pin the Extension to Chrome Toolbar
1. Click the puzzle icon (🧩 **Extensions**) in the top-right of your Chrome window.
2. Find **ChatShift** in the list.
3. Click the pin icon (📌) to pin it next to the address bar for easy one-click access.

---

## 🚀 How to Use ChatShift

### 1. Open an AI Chat
Navigate to any supported platform and open an existing conversation or start a new one:
- [ChatGPT](https://chatgpt.com)
- [Claude](https://claude.ai)
- [Gemini](https://gemini.google.com)
- [Perplexity](https://perplexity.ai)

### 2. Open the ChatShift Side Panel
- Click the pinned **ChatShift icon** in your Chrome toolbar.
- The **Chrome Side Panel** opens on the right side of your browser alongside your chat.
- Alternatively, open Chrome's Side Panel icon (next to extensions) and switch the dropdown menu to **ChatShift**.

### 3. Review Detected Conversation
ChatShift will immediately inspect the active tab and show:
- Source badge (e.g. `CHATGPT`, `CLAUDE`, `GEMINI`, or `PERPLEXITY`).
- Conversation title and total turn count.
- Size estimate in kilobytes.

### 4. Choose Your Export Format
Select your preferred export layout via the format tabs:
- **TXT / Markdown**: Formatted conversation transcript with clear `User` and `Assistant` headers and markdown code blocks.
- **JSON**: Pure structured data containing turn indices, timestamps, roles, and message content.

### 5. Take Action
Choose what you want to do with the conversation:

#### Option A: Transfer to Another LLM (Primary Workflow)
1. Click **Transfer Context**.
2. Select your destination platform (**ChatGPT**, **Claude**, **Gemini**, or **Perplexity**).
3. ChatShift will:
   - Open the target platform in a new tab.
   - Wait for the page and message composer to load.
   - Inject the conversation context directly into the chat prompt box with an instruction banner:
     > *"Below is the prior conversation history from [Platform]. Please use it as context to continue our discussion:"*
4. **Review and Send**: Inspect the pre-filled text in the input box, add any extra instructions, and press **Enter**!

#### Option B: Copy to Clipboard
- Click **Copy Context** to copy the formatted transcript to your system clipboard for pasting into text editors, Slack, Discord, or documentation.

#### Option C: Download File
- Click the download icon button to download the conversation file (`.txt` or `.json`) directly to your machine's `Downloads` directory.

---

## 🔄 Making Changes & Reloading (Developer Workflow)

When you modify the code in the extension, Chrome does not always reload all components automatically. Follow this workflow:

### When Modifying Extension Code
| File Changed | How to Reload in Chrome |
| :--- | :--- |
| **`manifest.json`** | Go to `chrome://extensions` and click the **Reload (🔄)** icon on the ChatShift card. |
| **`src/background/*`** | Go to `chrome://extensions` and click the **Reload (🔄)** icon. |
| **`src/sidepanel/*`** | Close and reopen the Side Panel, or right-click inside the Side Panel and choose **Inspect**, then press `Ctrl+R` / `F5`. |
| **`src/content/*` or `src/extractors/*`** | Reload the extension card on `chrome://extensions`, then **refresh (`F5`) the active AI webpage tab**. |

### Debugging & Inspecting Logs
- **Background Service Worker**: Go to `chrome://extensions`, find ChatShift, and click the blue link next to **Inspect views: `service worker`**. This opens Chrome DevTools for background tasks and messages.
- **Side Panel UI**: Right-click anywhere inside the ChatShift Side Panel and click **Inspect** to debug HTML, CSS, and `app.js` console output.
- **Content Scripts & Extractors**: Open DevTools (`F12`) on the target AI web page (e.g. `chatgpt.com`), and check the Console tab for injector or extractor logs.

---

## 📂 Project Architecture

```text
Chatshift/
├── manifest.json              # Extension Manifest V3 configuration
├── assets/                    # Extension icons (16, 32, 48, 128px)
├── scripts/                   # Icon and build utilities
│   ├── build-assets.mjs
│   ├── generate-icons.mjs
│   └── test-png.mjs
├── src/
│   ├── background/
│   │   └── service-worker.js  # Coordinates tabs, extraction, and side panel events
│   ├── content/
│   │   └── injector.js        # Content script injected into AI tabs
│   ├── extractors/            # Platform-specific DOM conversation parsers
│   │   ├── chatgpt.js         # ChatGPT extractor
│   │   ├── claude.js          # Claude.ai extractor
│   │   ├── gemini.js          # Gemini extractor
│   │   └── perplexity.js      # Perplexity extractor
│   ├── formatter/             # Transcript formatting engines
│   │   ├── text.js            # Clean Markdown/TXT generator
│   │   └── json.js            # Structured JSON generator
│   ├── sidepanel/             # Chrome Side Panel UI
│   │   ├── index.html         # Panel layout
│   │   ├── style.css          # Dark-theme, high-performance styling
│   │   └── app.js             # State machine, reactive UI, and user interactions
│   └── transfer/              # Pre-fill automation for target LLM input fields
│       ├── chatgpt.js
│       ├── claude.js
│       ├── gemini.js
│       └── perplexity.js
├── CHROMEWEBSTORE.md          # Chrome Web Store metadata & store description
└── README.md                  # This developer & user guide
```

---

## 🔐 Permissions Explanation

Every permission in [`manifest.json`](file:///d:/Code/Chrome%20Extensions/Chatshift/manifest.json) is scoped strictly to support the transfer utility:

| Permission | Purpose |
| :--- | :--- |
| `sidePanel` | Displays the extension UI inside Chrome's native Side Panel beside AI tabs. |
| `scripting` | Executes platform extractors on the active AI chat page to read messages. |
| `tabs` | Identifies active AI tabs and opens the destination AI tab during transfer. |
| `downloads` | Saves conversations as local `.txt` or `.json` files to your Downloads folder. |
| `clipboardRead` / `clipboardWrite` | Enables copying formatted conversation context to your system clipboard. |
| `storage` | Safely stores temporary payloads passed from the source tab to the destination tab. |
| `host_permissions: *://*/*` | Allows running DOM extractors and transfer scripts across supported AI domains. |

---

## ❓ Frequently Asked Questions (FAQ)

### Q: Why does it say "Source Not Supported"?
Make sure your active browser tab is on one of the supported websites (`chatgpt.com`, `claude.ai`, `gemini.google.com`, or `perplexity.ai`) and that an actual conversation thread is open.

### Q: Will ChatShift automatically send the message on the new AI platform?
**No.** ChatShift fills the message composer with the context transcript, but it intentionally does **not** simulate an "Enter" press. This gives you the opportunity to review, amend, or attach additional questions before submitting.

### Q: Does ChatShift store or transmit my conversations to external servers?
**No.** All extraction, formatting, and transfer operations happen entirely in-memory within your local Chrome instance. No conversation data ever leaves your computer.

### Q: Can I use this in Brave, Edge, or Arc?
**Yes.** Any browser based on the Chromium engine that supports Manifest V3 and Chrome extensions can load and run ChatShift using the same "Load unpacked" developer steps.
