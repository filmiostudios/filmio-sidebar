# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-04-07

### Added
- Chrome MV3 extension scaffolding (manifest, service worker, content script, side panel)
- Google OAuth sign-in via `chrome.identity.getAuthToken`
- Chat UI: message thread, streaming text, three-dot loading indicator
- Loading state sequence: idle → thinking → searching KB → slow (8s timeout)
- Markdown rendering via react-markdown + remark-gfm
- KB sources indicator below assistant messages
- Empty state with greeting, doc title, and 3 suggested prompts
- Panel size toggle: Side (25%) / Wide (40%) / Full (50%)
- Conversation persistence per doc via `chrome.storage.local`
- Session key format: `sidebar-{userEmail}-{docId}`
- SSE streaming from OC `/hooks/agent` endpoint
- Doc ID + title auto-detected from Google Docs URL and page title
- Content script watches for SPA navigation (doc changes without full reload)
- Sign-in screen with Google OAuth button

### Architecture
- Background service worker handles all auth + API calls (no fetch from content/sidebar)
- Message passing via `chrome.runtime.sendMessage` between all layers
- TypeScript strict mode throughout
- Tailwind CSS for styling

### Known limitations (v0.1)
- No inline doc editing (planned v0.2)
- Auth stubbed to `chrome.identity` — requires Chrome Web Store OAuth client ID for production; works with test OAuth during development
- No conversation history browser (planned v0.3)
