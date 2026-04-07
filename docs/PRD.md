# PRD: Filmio AI Sidebar

**Status:** Active  
**Owner:** Bryan Hertz  
**Agent lead:** MiniMe  
**Last updated:** 2026-04-07  
**Linear:** OC Fleet project

---

## Problem

Working in Google Docs without an AI assistant means context-switching constantly — opening a separate ChatGPT tab, re-explaining what you're working on, copying text back and forth. The native Gemini sidebar is closed (Google's model only, no custom KB, no Filmio domain knowledge). The `@minime` comment handler we built is async and unreliable — wrong architecture for interactive editing work.

The team needs a Filmio-aware AI assistant that:
- Lives inside Google Docs (no context switching)
- Knows the KB, GoScore methodology, APPSIE, company decisions
- Remembers the conversation within a doc session
- Can eventually apply edits directly to the document

---

## Solution

A Chrome extension that opens a Side Panel alongside any Google Doc. Chat with MiniMe, grounded in the Filmio KB, streamed in real time, with conversation history that persists across sessions on the same doc.

---

## Users

**v0.1:** Bryan Hertz, Corey Hertz  
**v0.2:** Full Filmio team (Steve, Stipe, Chris B, Chris D, Ian, Luciana, Milica, Dimitar)  
**Future:** Any BClaw-powered team

Each user gets their own KB access scope (matching their Drive permissions). Executives see all docs. Marketing sees marketing + company. Etc.

---

## User Stories

**Bryan writing a strategy doc:**
> "I'm in a Google Doc drafting our Q3 investor narrative. I open the sidebar, ask 'What does our GoScore methodology say about audience prediction confidence?' MiniMe searches the KB, pulls the relevant sections from the GoScore V3 PRD, cites them, and gives me a clean paragraph I can insert."

**Corey reviewing a PRD:**
> "I'm editing the APPSIE product spec. I highlight a confusing section and ask 'Is this consistent with what we decided in the GoScore V3 PRD?' MiniMe compares both docs and flags the conflict."

**Stipe drafting Sherpa docs:**
> "I'm writing new Sherpa documentation. I ask 'What's the current Sherpa architecture?' MiniMe pulls from the KB and answers based on what's been documented."

---

## MVP Scope (v0.1)

**In:**
- Chrome Side Panel opens from toolbar icon on any `docs.google.com` page
- Google OAuth sign-in (one-time setup)
- Chat input → message sent to OC persistent session → streamed response
- Markdown rendering (code blocks, bold, lists, citations)
- Doc ID auto-detected from URL, sent as context in every message
- KB-grounded responses (Vertex AI Search, 87 docs, role-filtered)
- Conversation persists within a doc (close/reopen sidebar → same thread resumes)
- New doc → fresh context, no bleed

**Out (deferred):**
- Inline doc editing (v0.2)
- Conversation history browser (v0.3)
- Multi-doc context (v0.4)
- Team member access beyond Bryan + Corey (v0.2)

---

## UX Design

**Visual reference:** Match the Gemini sidebar aesthetic — clean white panel, subtle header showing doc context, chat thread below, input at the bottom.

**Panel header:**
```
[Filmio icon]  MiniMe                    [×]
GoScore V3 PRD · Official-Draft
```

**Message thread:**
- User messages: right-aligned, blue pill
- MiniMe messages: left-aligned, white card
- Streaming: text appears token by token (no loading spinner for first response)
- KB citations shown below message when KB results used:
  `📎 Sources: GoScore V3 PRD, Company Overview`

**Input area:**
```
[                              ] [Send ↑]
Shift+Enter for new line
```

**First-time experience:**
```
[Google G icon]
Sign in with your filmio.studio account
to use MiniMe in Google Docs

[Sign in with Google]
```

**Empty state (after auth, no messages yet):**
```
Hey Bryan 👋
I'm looking at: GoScore V3 PRD

Ask me anything about this doc,
the Filmio KB, or your work.

Suggested: "Summarize this doc"
           "What's the GoScore methodology?"
           "Anything inconsistent here?"
```

---

## Success Criteria (v0.1)

- [ ] Sidebar opens in <500ms after clicking icon
- [ ] First token streams in <3s of sending message
- [ ] "What is GoScore?" returns KB-grounded answer with citations
- [ ] Works on any Google Doc (not just specific IDs)
- [ ] No auth prompt after first setup
- [ ] Session resumes correctly after sidebar close/reopen
- [ ] New doc = new session (no context bleed)
- [ ] Markdown renders correctly (code, bold, lists)
- [ ] Works on Chrome 114+ on Mac

---

## Out of Scope (v0.1)

- Inline doc editing — v0.2
- Comment thread integration — stays separate (async @minime stays)
- Mobile / Safari — Chrome-specific APIs, not feasible
- Voice input — future
- General web AI (this is Docs + Filmio KB only)

---

## Roadmap

**v0.1 (now):** Core chat, KB search, streaming, auth, persistence  
**v0.2:** Inline edits ("Apply to doc" button), full team rollout  
**v0.3:** Conversation history browser, suggested prompts based on doc status  
**v0.4:** Multi-doc context, compare two docs  
**Future (BClaw):** Standalone web app with same backend, broader workflows

---

## Dependencies

| Dependency | Status |
|------------|--------|
| OC `/hooks/agent` endpoint | ✅ Live |
| Vertex AI Search (87 docs) | ✅ Live |
| KB Relationship Map | ✅ Live |
| Query Understanding Classifier | ✅ Live |
| Drive-native access_tier system | ✅ Live |
| gdoc-agent SKILL.md | ✅ Live |
| Chrome extension repo + CLAUDE.md | ✅ Scaffolded |

Backend is fully ready. This project is frontend-only.

---

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Chrome Side Panel API changes | Low | MV3 + Side Panel API stable since Chrome 114 |
| OC session delivery failures (repeat of comment handler issue) | Medium | Different path — SSE from background service worker, not webhook delivery. Tested pattern. |
| Auth token expiry mid-conversation | Low | Background refreshes on 401, resends last message |
| Latency >3s for first token | Medium | Query classifier + relationship map are pre-loaded; Vertex search is the variable. Monitor in v0.1. |

---

## Open Questions

None blocking v0.1.
