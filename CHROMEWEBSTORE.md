# Chrome Web Store Listing — ChatShift

**Extension Name**: ChatShift  
**Summary**: Transfer entire AI conversations seamlessly between ChatGPT, Claude, Gemini, and Perplexity.  
**Category**: Developer Tools / Productivity  
**Manifest Version**: 3  
**Current Version**: 1.0.0  
**Last Updated**: September 3, 2026  

---

## Detailed Description

**ChatShift** is a professional, developer-focused Chrome Side Panel utility that lets you extract full multi-turn conversations from any AI chat interface (ChatGPT, Claude, Gemini, Perplexity) and transfer them directly to another LLM without manual copy-pasting.

### Key Features
- **Auto-Detection**: Automatically detects active conversation threads on supported AI websites.
- **Full Turn Extraction**: Preserves user prompts, AI responses, code blocks, lists, tables, and Markdown formatting.
- **Dual Format Support**: Choose between clean Markdown/Text (`TXT`) or structured `JSON`.
- **One-Click LLM Transfer**: Open ChatGPT, Claude, Gemini, or Perplexity with context pre-inserted into the message composer.
- **No Auto-Send Guarantee**: Context is safely prepared for user review before sending.
- **Local Device Download**: Save conversations directly to your machine as `.txt` or `.json`.
- **Privacy-First**: 100% client-side. No remote analytics, no tracking, no external server storage.

---

## Permissions Justification

| Permission | Justification |
|------------|---------------|
| `sidePanel` | Provides the dedicated, narrow vertical side-panel UI for continuous workflow beside AI tabs. |
| `scripting` | Injects modular extractors to read conversation DOM elements on supported AI websites. |
| `tabs` | Detects the active AI platform URL, conversation title, and coordinates tab creation for context transfer. |
| `downloads` | Enables saving conversation logs locally to the user's filesystem in TXT or JSON format. |
| `clipboardRead` / `clipboardWrite` | Copies formatted conversation context to the user's clipboard for instant manual or automatic pasting. |
| `storage` | Temporarily caches session transfer payloads between source and destination tabs. |
| `host_permissions: *://*/*` | Enables script injection on ChatGPT (`chatgpt.com`, `chat.openai.com`), Claude (`claude.ai`), Gemini (`gemini.google.com`), and Perplexity (`perplexity.ai`). |

---

## Privacy & Data Handling
- **Data Collected**: None.
- **Remote Communications**: None. All operations occur strictly within Chrome on the user's local device.
- **Local Storage**: Conversation context is held in memory and session storage solely for the duration of the active browser session.

---

## Version History
- **1.0.0 (2026-09-03)**: Initial release featuring Side Panel interface, 4 platform extractors (ChatGPT, Claude, Gemini, Perplexity), TXT/JSON formatters, and local download support.
