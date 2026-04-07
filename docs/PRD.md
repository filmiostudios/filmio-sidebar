# PRD: Filmio AI Sidebar v0.1

**Status:** Active  
**Owner:** Bryan Hertz  
**Agent lead:** MiniMe  
**Last updated:** 2026-04-07

---

## Problem

The current @minime comment workflow in Google Docs has too many failure layers:
- Comment threads aren't designed for multi-turn iteration
- No persistent context across doc sessions
- No streaming — users wait for a full reply
- No visibility into what the agent is doing

Team members need AI assistance while working in Docs without leaving the document or fighting with comment threads.

## Solution

A Chrome Side Panel that opens alongside any Google Doc, providing:
- Persistent chat with MiniMe grounded in the Filmio KB
- Streaming responses (real-time)
- Inline edits applied directly to the doc
- Full conversation history preserved across sessions via LCM

## Users

Initially: Bryan Hertz and Filmio team members with Google Workspace accounts.  
Eventually: Any team using BClaw + Google Workspace.

## MVP Scope (v0.1)

**In:**
- Chrome Side Panel opens from toolbar icon on `docs.google.com`
- Chat input → sends to OC session → streams response back
- Markdown rendering in response (code blocks, bold, lists)
- Doc ID auto-detected from URL, sent as context
- Auth: Google OAuth via `chrome.identity`

**Out (deferred):**
- Inline doc edits (v0.2)
- Persistent history UI (v0.3)
- Multi-doc context (v0.4)

## Success criteria (v0.1)

- [ ] Sidebar opens in <500ms after clicking icon
- [ ] First token streams in <3s of sending message
- [ ] Correct response grounded in KB for "What is GoScore?" query
- [ ] Works on any Google Doc (not just specific IDs)
- [ ] No auth prompt after first setup

## What we're NOT building

- A general-purpose ChatGPT clone (BClaw is that — this is Docs-specific)
- A replacement for the comment handler (that stays for async @mentions)
- Desktop app or mobile

## Open questions

None blocking MVP.
