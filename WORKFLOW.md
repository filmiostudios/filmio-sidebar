---
tracker:
  kind: linear
  project: e37d354f-2ab7-44c7-af7d-b83550d5b8ce
  active_states: [Todo, In Progress]
  terminal_states: [Done, Cancelled, Duplicate]
polling:
  interval_ms: 60000
workspace:
  root: /tmp/symphony_workspaces/filmio-sidebar
agent:
  max_concurrent_agents: 1
---

# Workflow: filmio-sidebar

## What this repo is
Chrome MV3 extension providing a persistent AI sidebar inside Google Docs. Connects to Filmio's OpenClaw infrastructure for KB-grounded responses and inline doc editing.

## Stack
- Chrome MV3 (Manifest V3) — no V2 APIs
- React 18 + TypeScript + Tailwind CSS
- Vite (build)
- Chrome Side Panel API (not chrome.windows.create)
- Backend: Filmio OC `/hooks/agent` endpoint

## Before touching any code
1. Read `CLAUDE.md` fully — it has critical MV3 constraints
2. `npm install` to ensure deps are current
3. Load extension from `dist/` as unpacked in Chrome developer mode
4. Have a real Google Doc open to test against

## How to handle issues
When assigned a Linear issue from this project:
1. Read CLAUDE.md first — especially the MV3 constraints section
2. Branch from main: `feat/BRY-NNN-description` or `fix/BRY-NNN-description`
3. `npm run dev` to build with watch
4. Test in Chrome with a real Google Doc (not a mock)
5. `npm run build` — must pass clean before PR
6. Open PR, link to Linear issue

## Key constraints
- MV3 only — no `background.js` persistent page, no `eval()`, no Manifest V2 APIs
- Side Panel API requires Chrome 114+
- No direct fetch from content scripts — route through background service worker
- No hardcoded tokens, URLs, or user emails anywhere in source
- Auth via `chrome.identity` API only

## Definition of done
- [ ] `npm run build` passes with no TypeScript errors
- [ ] Extension loads in Chrome without errors in `chrome://extensions`
- [ ] Sidebar opens on a real Google Doc
- [ ] Feature/fix verified end-to-end in browser (not just compiled)
- [ ] CLAUDE.md updated if new patterns introduced
- [ ] CHANGELOG.md entry added
- [ ] Linear issue updated with PR link
