# ARCHITECTURE.md — Filmio AI Sidebar

**Status:** v0.1 — approved for implementation  
**Last updated:** 2026-04-07  
**Owner:** MiniMe / Bryan Hertz

---

## Overview

The Filmio AI Sidebar is a Chrome MV3 extension that opens a persistent Side Panel alongside any Google Doc. It connects the Filmio team to MiniMe (via OpenClaw persistent sessions), the Filmio Knowledge Base (via Vertex AI Search), and the Google Doc itself (via Docs API / content script).

This is not a general AI assistant. It's a Filmio-domain-aware tool: every response is grounded in the KB, context-aware about the document open, and tied to a persistent session that remembers prior conversation within a doc.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Chrome Browser                        │
│                                                              │
│  ┌──────────────────┐   chrome.runtime   ┌───────────────┐  │
│  │  Content Script  │◄──────────────────►│  Side Panel   │  │
│  │  (docs.google.   │                    │  (React app)  │  │
│  │   com only)      │                    │               │  │
│  │                  │                    │  Chat thread  │  │
│  │  - reads doc ID  │                    │  Input box    │  │
│  │  - reads cursor/ │                    │  Streaming    │  │
│  │    selection     │                    │  responses    │  │
│  │  - applies edits │                    └───────┬───────┘  │
│  └──────────────────┘                           │           │
│                                                 │           │
│                    ┌────────────────────────────┘           │
│                    ▼                                        │
│           ┌─────────────────┐                               │
│           │ Service Worker  │ ← Auth, session routing,      │
│           │ (background)    │   API calls, SSE streaming    │
│           └────────┬────────┘                               │
└────────────────────┼────────────────────────────────────────┘
                     │ HTTPS / SSE
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               Filmio Production Stack                        │
│                                                              │
│   OC Host (5.78.187.237)          Prod (178.156.216.43)     │
│   ┌────────────────────┐          ┌──────────────────────┐  │
│   │ OpenClaw Gateway   │          │ Vertex AI Search     │  │
│   │ /hooks/agent       │          │ kb-search-vertex.py  │  │
│   │                    │          │ 87 docs indexed      │  │
│   │ Persistent sessions│          │ GCS-backed           │  │
│   │ LCM compression    │          └──────────────────────┘  │
│   │ KB context inject  │                                     │
│   └────────────────────┘          ┌──────────────────────┐  │
│                                   │ KB Relationship Map  │  │
│                                   │ Query Classifier     │  │
│                                   │ (Haiku)              │  │
│                                   └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Content Script (`src/content/`)

Injected into `docs.google.com` pages only (scoped in manifest).

**Reads:**
- Doc ID from URL (`/document/d/{DOC_ID}/edit`)
- Selected text via `window.getSelection()`
- Cursor paragraph context via `document.activeElement`

**Writes:**
- Text insertions/replacements via simulated DOM events (MV3 restriction — cannot use Docs API directly from content script)
- Falls back to posting to background service worker which calls Docs API with DWD auth

**Messages to sidebar:**
```typescript
{ type: "DOC_CONTEXT", docId, selectedText, title }
{ type: "EDIT_APPLIED", success, insertedText }
```

**Does NOT:**
- Make API calls (all through background service worker)
- Store state (stateless per page load)

---

### 2. Service Worker (`src/background/`)

The brain. Handles everything that needs persistent execution or external network calls.

**auth.ts:**
- `chrome.identity.getAuthToken()` → Google OAuth token (scopes: `documents`, `drive.readonly`, `userinfo.email`)
- Stores token + user email in `chrome.storage.local`
- Refreshes on 401

**session.ts:**
- Constructs `sessionKey = sidebar-{userEmail}-{docId}`
- Per-doc persistent session → OC remembers the full conversation for this user in this doc
- On new doc → new session key → fresh context, but user identity persists

**api.ts:**
- `POST /hooks/agent` → sends message, streams SSE response back
- Parses `text/event-stream` via `ReadableStream` reader (NOT EventSource — CORS issues)
- Forwards chunks to sidebar via `chrome.tabs.sendMessage`
- On stream end → writes final message to `chrome.storage.local` for history

**Message from sidebar → service worker:**
```typescript
{ type: "SEND_MESSAGE", text, docContext }
{ type: "GET_HISTORY", sessionKey }
{ type: "APPLY_EDIT", docId, insertText, replaceText }
```

---

### 3. Side Panel React App (`src/sidebar/`)

Opened via `chrome.sidePanel.open()`. Runs as a standalone HTML page within Chrome's Side Panel chrome.

**App.tsx:**
- Auth gate: if no token → show "Sign in with Google" button
- Main layout: doc context header + chat thread + input

**Chat.tsx:**
- Scrollable message list
- `useEffect` listens for `chrome.runtime.onMessage` stream chunks
- Appends tokens to in-progress assistant message in real time

**Input.tsx:**
- Textarea (shift+enter for newline, enter to send)
- "Stop" button during streaming (sends `{ type: "ABORT_STREAM" }` to background)
- Disabled while streaming

**Message.tsx:**
- `react-markdown` for rendering — handles code blocks, bold, lists, tables
- User messages: right-aligned, blue background
- Assistant messages: left-aligned, white, with KB source citations shown below if present
- "Apply to doc" button appears on assistant messages that contain suggested text edits

**State management:** React `useState` + `useReducer` (no Redux for v0.1 — overkill). History persisted in `chrome.storage.local`, loaded on panel open.

---

### 4. Backend: OC `/hooks/agent` Endpoint

Already built. The sidebar sends:
```json
{
  "message": "What's the current GoScore methodology?",
  "sessionKey": "sidebar-bryan@filmio.studio-1TmqXycnd4FWskyHz1...",
  "token": "{OC_HOOK_TOKEN}"
}
```

OC creates/resumes persistent session for that key. The session's system prompt (injected by gdoc-agent skill):
- Loads Filmio KB relationship map (~7.3K tokens, always present)
- Runs Vertex AI Search on the user's query (top 5 results, role-filtered)
- Injects current doc context (title, doc ID, status from header table)
- Uses Claude Sonnet 4.6 (1M context, 32K output)
- Streams tokens back as SSE

**Session key design:**
- `sidebar-{email}-{docId}` → one conversation per user per doc
- Switching docs → new session, previous context gone (correct behavior)
- Closing/reopening sidebar → same session resumes (LCM compresses as it grows)

---

## Auth Flow

```
1. User clicks extension icon → sidebar opens
2. Sidebar checks chrome.storage.local for { token, userEmail }
3. If missing → "Sign in with Google" shown
4. Click → background calls chrome.identity.getAuthToken({ interactive: true })
5. Chrome shows Google consent screen (scopes: userinfo.email, documents, drive.readonly)
6. Token stored in chrome.storage.local
7. Background fetches user email from userinfo endpoint → stores too
8. Sidebar refreshes → shows chat UI
9. On subsequent opens → token loaded from storage, no prompt (until expiry)
```

**Token storage:** `chrome.storage.local` (not `sync` — tokens are sensitive and device-specific).

**OC hook token:** Hardcoded in `shared/constants.ts` as `OC_HOOK_TOKEN` — this is the shared secret for the `/hooks/agent` endpoint. Not the user's Google token. Acceptable because this is an internal tool, not a public extension.

---

## Data Flow: Sending a Message

```
1. User types in Input.tsx → hits Enter
2. Sidebar reads docContext from chrome.storage.local (set by content script on load)
3. Sidebar sends { type: "SEND_MESSAGE", text, docContext } to background
4. Background builds request:
   { message: text + docContext, sessionKey, token }
5. Background POSTs to oc.filmio.cloud/hooks/agent
6. OC gateway routes to persistent session (creates if new)
7. Session runs: KB search → context assembly → Claude Sonnet → streaming response
8. OC streams SSE chunks back
9. Background parses ReadableStream, forwards each chunk to sidebar tab
10. Chat.tsx appends chunks to in-progress message (streaming effect)
11. On [DONE] event → message finalized, saved to chrome.storage.local history
```

---

## Inline Edit Flow (v0.2, documented now for architecture clarity)

```
1. Assistant responds with suggested text edit
2. "Apply to doc" button appears on message
3. User clicks → sidebar sends { type: "APPLY_EDIT", insertText, replaceText } to background
4. Background calls Docs API (batchUpdate) with DWD auth (service account + minime@film.io)
5. Edit applied → content script receives DOM mutation event, confirms
6. Sidebar shows "✓ Applied" on message
```

Why DWD instead of user OAuth for edits: The user's OAuth token from `chrome.identity` has `documents` scope — we CAN use it directly. But DWD gives us audit trail (all edits attributed to minime@film.io) which is the governance model. v0.1 uses user OAuth for simplicity, v0.2 evaluates DWD.

---

## Persistence Model

| What | Where | Lifetime |
|------|-------|----------|
| Google OAuth token | `chrome.storage.local` | Until revoked or Chrome clears it |
| User email | `chrome.storage.local` | Same |
| OC hook token | `src/shared/constants.ts` | Deploy-time constant |
| Chat history | `chrome.storage.local` (keyed by sessionKey) | Until user clears extension data |
| Session context (LCM) | OC gateway (server-side) | Indefinite (LCM compresses) |
| Doc context | `chrome.storage.local` (refreshed each page load) | Current tab lifetime |

Local history cap: keep last 50 messages per sessionKey. Older messages still exist in OC's LCM — local is just for fast display on open.

---

## Security Considerations

- **Content Security Policy:** MV3 default CSP — no `eval()`, no inline scripts. All dynamic behavior via React (bundled, static).
- **Permissions requested:** `activeTab`, `sidePanel`, `storage`, `identity` — minimal. No `tabs`, no `history`.
- **Host permissions:** `https://docs.google.com/*` (content script) + `https://oc.filmio.cloud/*` (API) + `https://www.googleapis.com/*` (userinfo)
- **Sensitive data:** No doc content stored server-side beyond what OC LCM compresses for context. No Google tokens sent to our backend.
- **OC hook token:** Acceptable shared secret for internal tool. If leaked: rotate it in openclaw.json + constants.ts.

---

## Constraints & Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Chrome MV3 | Required | MV2 deprecated, Chrome Web Store requires MV3 |
| Side Panel API | `chrome.sidePanel` | True persistence, resizable, first-class Chrome UX |
| React 18 + Tailwind | Yes | Team familiarity, rapid UI iteration |
| No Redux | Correct for v0.1 | Overkill; `useState` + `chrome.storage` is sufficient |
| SSE not WebSocket | SSE | Simpler, one-directional streaming, OC already supports it |
| EventSource vs ReadableStream | ReadableStream | EventSource has CORS issues from extensions |
| Per-doc session key | Yes | Correct scoping — context stays relevant to doc |
| History stored locally | chrome.storage.local | Fast load, no extra API call, syncs with LCM state |

---

## v0.1 Acceptance Criteria

Before calling v0.1 done:

- [ ] Sidebar opens in <500ms on any `docs.google.com` page
- [ ] Auth flow works end-to-end (first sign-in, subsequent opens skip prompt)
- [ ] Sending a message → streaming response → renders correctly with markdown
- [ ] "What is GoScore?" returns KB-grounded answer with citations
- [ ] Session persists across sidebar close/reopen on same doc
- [ ] New doc → new session (no bleed from prior doc)
- [ ] Works in Chrome 114+ on Mac and Windows
- [ ] No console errors in `chrome://extensions` or DevTools

---

## Not In Scope (v0.1)

- Inline doc editing (v0.2)
- Conversation history browser / search (v0.3)
- Multi-doc context (v0.4)
- Mobile / Safari (never — Chrome-specific APIs)
- Voice input (future)
- Comment thread integration (separate system, stays async)

---

## Related Docs

- `docs/PRD.md` — Product requirements
- `CLAUDE.md` — Dev conventions, local setup, constraints
- `WORKFLOW.md` — Agent behavior rules
- Backend: `filmiostudios/infrastructure/scripts/comment_router.py`
- KB backend: `filmiostudios/infrastructure/scripts/kb_search_vertex.py`
- OC endpoint docs: `filmio/docs/team-agent-doc-integration-spec.md`
