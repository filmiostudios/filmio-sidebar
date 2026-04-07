# CLAUDE.md — Filmio AI Sidebar

Read this before touching any code.

## What this repo is

Chrome MV3 extension providing an AI sidebar inside Google Docs. Connects to Filmio's OpenClaw infrastructure for persistent sessions, Vertex AI Search for KB retrieval, and the Docs API for inline editing.

## Stack

- **Extension:** Chrome MV3, React 18, Tailwind CSS, Vite
- **Auth:** Google OAuth 2.0 (chrome.identity API)
- **Comms:** fetch + SSE for streaming, chrome.runtime.sendMessage for internal
- **Backend:** Filmio OC `/hooks/agent` endpoint (persistent sessions), `/webhooks/drive` (KB search)

## How to run locally

```bash
npm install
npm run dev          # builds to dist/, watches for changes
```

Load `dist/` as unpacked extension in Chrome. Open a Google Doc. The sidebar icon appears in the Chrome toolbar.

## Project structure

```
src/
  background/      ← service worker (auth, session management, API calls)
    index.ts       ← entry point
    auth.ts        ← Google OAuth flow
    session.ts     ← OC session routing
    api.ts         ← backend calls, SSE streaming
  content/         ← content script injected into docs.google.com
    index.ts       ← reads doc context, applies text edits
    docReader.ts   ← extracts doc ID, cursor position, selected text
    docWriter.ts   ← inserts/replaces text in document
  sidebar/         ← React app rendered in Chrome Side Panel
    App.tsx        ← root component
    Chat.tsx       ← message thread
    Input.tsx      ← prompt input + send button
    Message.tsx    ← individual message with markdown rendering
  shared/
    types.ts       ← shared TypeScript interfaces
    constants.ts   ← API endpoints, config
extension/
  manifest.json    ← Chrome MV3 manifest
  sidebar.html     ← Side Panel HTML shell
```

## Key constraints

1. **MV3 only** — no Manifest V2 APIs. Service worker, not background page.
2. **Side Panel API** — `chrome.sidePanel`, not `chrome.windows.create`. Requires Chrome 114+.
3. **No eval()** — MV3 CSP forbids it. No dynamic code execution.
4. **Auth via chrome.identity** — not window.location redirects. The extension handles OAuth internally.
5. **Streaming via SSE** — backend sends `text/event-stream`. Parse with `ReadableStream`, not EventSource (CORS).

## Backend endpoints

All on `https://oc.filmio.cloud` (OC host, port 443 via Caddy):

```
POST /hooks/agent
  Body: { message, sessionKey, token }
  sessionKey format: sidebar-{userEmail}-{docId}
  Returns: SSE stream of response chunks

GET /health
  Returns: { status: "ok" }
```

Credentials: OC hook token stored in `chrome.storage.local` (set during first auth flow). **Never hardcode tokens.**

## Coding conventions

- TypeScript strict mode everywhere
- No `any` types
- Components in `sidebar/` are pure React — no direct Chrome API calls (those go in `background/`)
- Message passing between content ↔ sidebar via `chrome.runtime.sendMessage`
- All API calls go through `background/api.ts` — never fetch directly from content scripts

## Before you commit

- [ ] `npm run build` passes with no errors
- [ ] Extension loads in Chrome without errors in `chrome://extensions`
- [ ] Open a real Google Doc — sidebar opens, chat works end to end
- [ ] No hardcoded tokens, URLs, or user data

## Testing

No automated test suite yet (v0.1). Manual test plan in `docs/TEST-PLAN.md`. Run it before any PR.

## Linear

Every issue → Linear, `OC Fleet` project. Branch format: `feat/BRYYY-description`. PR title includes issue number.
