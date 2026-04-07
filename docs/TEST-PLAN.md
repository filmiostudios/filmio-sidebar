# Manual Test Plan — Filmio Sidebar v0.1

Run this checklist before opening any PR. Check each box before marking done.

## Setup

1. `npm install`
2. `npm run build` — must pass with zero errors
3. Open `chrome://extensions`
4. Enable "Developer mode" (top right toggle)
5. Click "Load unpacked" → select the `dist/` folder
6. Verify extension appears with name "Filmio AI Sidebar" and no error badge

---

## Auth

- [ ] Open a Google Doc (e.g. `docs.google.com/document/d/...`)
- [ ] Click the Filmio toolbar icon → sidebar opens
- [ ] Sign-in screen appears (if first run or signed out)
- [ ] Click "Sign in with Google" → Google OAuth prompt appears
- [ ] Sign in with a filmio.studio account
- [ ] Sidebar transitions to chat view showing "Hey {name} 👋"
- [ ] Close and reopen sidebar → stays signed in, no second prompt

---

## Doc detection

- [ ] Open a Google Doc → header shows doc title (not just the ID)
- [ ] Open a *different* Google Doc → header updates to new title
- [ ] Non-Doc Google page (Drive, Sheets) → toolbar icon disabled or sidebar shows "No doc open"

---

## Chat — basic flow

- [ ] Type a message, press Enter → message appears right-aligned in orange pill
- [ ] Three-dot loading indicator appears within 100ms
- [ ] "Searching KB..." label appears ~500ms after sending
- [ ] First streaming token appears → dots and label vanish, text starts appearing
- [ ] Full response renders with markdown (bold, lists, code blocks if present)
- [ ] KB sources appear below message when KB was searched (📎 Source name, ...)
- [ ] Input is disabled during streaming, re-enables when done

---

## Chat — loading states

- [ ] Send a message and watch: dots → "Searching KB..." → streaming text (normal flow)
- [ ] Simulate slow response (disconnect from VPN temporarily): "Taking longer than usual..." appears after 8s

---

## Empty state

- [ ] Fresh conversation (no messages) → shows greeting with doc title
- [ ] Three suggested prompt pills visible with ↪ icon
- [ ] Click a suggested prompt → sends that message, conversation begins

---

## Conversation persistence

- [ ] Send several messages in Doc A
- [ ] Close sidebar, reopen → same messages appear
- [ ] Open Doc B → conversation is empty (clean slate)
- [ ] Return to Doc A → Doc A's conversation is still there

---

## Panel sizing

- [ ] Click S → panel narrows (~25% viewport)
- [ ] Click W → panel widens (~40% viewport)
- [ ] Click F → panel expands (~50% viewport)
- [ ] Active size button shows Filmio orange background

---

## Markdown rendering

Send this message and verify formatting:
```
test: **bold** `inline code` 
- bullet one
- bullet two
```
- [ ] **bold** renders as bold
- [ ] `inline code` renders in monospace gray pill
- [ ] Bullet list renders correctly (not as raw markdown)

---

## Error handling

- [ ] Disconnect from internet, send a message → error message appears in chat (not a crash)
- [ ] Error message does NOT say "copy this back into your Google Doc" or anything requiring manual copy-paste

---

## Build verification

- [ ] `npm run build` passes with no TypeScript errors
- [ ] `npm run typecheck` passes
- [ ] `dist/` contains: `background.js`, `content.js`, `sidebar.html`, CSS file, `manifest.json`
- [ ] No hardcoded tokens or email addresses in built output (check `dist/background.js` for `OC_HOOK_TOKEN` — should be present as the service token, but no user credentials)
