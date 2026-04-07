# Gemini Sidebar Gap Analysis
**Conducted:** 2026-04-07  
**Method:** Live teardown by Bryan Hertz, screenshots reviewed by MiniMe  
**Purpose:** Identify what to adopt, adapt, or leapfrog in the Filmio AI Sidebar

---

## What We Reviewed

Four states of the Gemini sidebar ("Ask Gemini") in Google Docs:
1. Response view — after a full document edit request
2. Hamburger menu — Gems + history options
3. More suggestions — full preset library
4. More suggestions (confirmed) — filter tabs + full prompt list

---

## Feature-by-Feature Analysis

### Panel Layout & Sizing

**Gemini:** Side/Wide toggle accessible from resize icon top-right. Two modes. Default is narrow (~320px), Wide expands to ~30% of screen. Panel title is context-aware ("Writing editor" when in that Gem mode, "Ask Gemini" otherwise).

**Our decision:** ✅ Adopt Side/Wide toggle. Match the resize icon placement. Panel title should show current mode name (e.g. "MiniMe · KB Search"). Add a third size option — "Full" at ~50% for long document work.

---

### Gems / Modes

**Gemini:** 3 built-in Gems — Writing editor, Brainstormer, plus "View all gems" (generic Google-built personas). Not customizable. Not document-aware.

**Our decision:** ✅ Adopt the concept, leapfrog the execution. Our modes map to query classifier intents:

| Mode | Classifier intent | Behavior |
|------|------------------|----------|
| **Ask** | `answer_question` | KB-grounded Q&A, show citations |
| **Edit** | `edit_doc` | Apply-to-doc mode, show diff preview |
| **Write** | `create_content` | Draft new content, insert at cursor |
| **Explore** | `answer_question` (broad) | Exploratory, relationship map prominent |

Mode selection pre-sets intent + UI layout. Classifier still runs but starts with strong prior from selected mode.

---

### Suggested Prompts

**Gemini:** Static, generic, document-agnostic. Categories: Ask / Summarize / Refine / Write. Examples: "Create a list of conferences," "Write a blog post about an upcoming launch." Zero relevance to the actual document open.

**Our decision:** 🚀 Leapfrog. Generate 3–4 suggested prompts **dynamically on sidebar open**, based on:
- Doc title + status from header table
- Top 2 entries from KB relationship map for this doc's topic area
- Haiku inference (< 300 tokens, < $0.001/open)

Example for GoScore V3 PRD:
- ↳ *"Summarize the key changes from V2 to V3"*
- ↳ *"Are there conflicts with the V4 spec?"*
- ↳ *"What does the FES calculation methodology say?"*
- ↳ *"Compare this doc's status to related docs"*

Adopt Gemini's ↳ arrow affordance — clean tap-to-use UX.

---

### History Management

**Gemini:** "Clear history" in hamburger — nuclear option only. No conversation list, no named threads, no per-doc organization.

**Our decision:** 🚀 Leapfrog. Per-doc conversation threads via sessionKey (`sidebar-{email}-{docId}`). History panel accessible from hamburger showing:
- Thread name (auto-generated from first message)
- Doc it's attached to
- Date
- Option to clear individual thread or all

Powered by LCM — history compresses gracefully, never hits a hard limit.

---

### Sources / KB Grounding

**Gemini:** `+` button opens a menu to manually add specific Drive files as sources. Users toggle sources on/off per session. No automatic KB search — fully manual. No visibility into what sources informed a response.

**Our decision:** ✅ Adopt source visibility, 🚀 leapfrog the mechanism. Our KB search is automatic (Vertex AI Search, 87 docs, role-filtered). But adopt Gemini's transparency pattern:

After each response, show:
```
📎 Sources used: GoScore V3 PRD · Company Overview · APPSIE Spec
```

Add a "Sources" panel (accessible from `+` button) showing:
- KB docs currently indexed (count + last updated)
- Which docs were retrieved for the last query
- User's access tier (so they understand why some docs don't appear)

---

### Response UX & Applying Edits

**Gemini:** Response is dumped as raw text in the panel. For full document edits, Gemini writes the entire revised content in the panel with a message like "Here is the full, revised sequence for you to review and copy back into your Google Doc." User must manually copy-paste. Insert button (↑ arrow) inserts the entire last response at cursor position — no formatting, no targeting, no diff.

**Our decision:** 🚀 Major leapfrog. This is our primary differentiation:

**v0.1:** Copy button (match Gemini). Insert-at-cursor button (match Gemini, but with markdown formatting preserved).

**v0.2:** 
- **Diff preview** — show what would change before applying. Accept/Reject per section.
- **Targeted insert** — "Insert after paragraph 3" not just at cursor
- **Edit attribution** — edits logged via Docs API with minime@film.io as author

Never say "copy this back into your doc." That UX is a failure mode we're eliminating.

---

### Loading / Thinking State

**Gemini:** Loading spinner shown, then full response appears. No streaming — response dumps all at once. No indication of what it's doing (searching, thinking, writing).

**Our decision:** 🚀 Leapfrog. Streaming SSE from first token. Three-dot pulse while KB search + classifier run (2–4s window). "Searching KB..." status line before first token when retrieval is happening. Feels live, never feels frozen.

---

### Bottom Bar

**Gemini:** `+` (sources) · sliders icon (presets) · send arrow. "Gemini in Workspace can make mistakes. Learn more" disclaimer.

**Our decision:** ✅ Adopt the minimal bottom bar pattern. Our version:
- `+` → sources panel (KB status + active sources)
- Mode icon → switch between Ask/Edit/Write/Explore modes
- Send arrow (disabled during streaming, shows Stop during generation)

Skip the disclaimer for internal tool — adds visual noise with no legal necessity for us.

---

## Summary: Adopt / Adapt / Leapfrog

| Feature | Decision | Notes |
|---------|----------|-------|
| Side/Wide panel toggle | ✅ Adopt + add Full mode | Match resize icon placement |
| Context-aware panel title | ✅ Adopt | "MiniMe · [mode]" |
| Modes/Gems concept | ✅ Adapt | Our 4 modes map to classifier intents |
| ↳ tap-to-use prompt affordance | ✅ Adopt | Clean UX pattern |
| Suggested prompts | 🚀 Leapfrog | Dynamic, doc-aware, Haiku-generated |
| Source visibility | ✅ Adopt | Show which KB docs informed response |
| Manual source toggle | ➡️ Skip | Our auto-search is better; sources panel shows results |
| History management | 🚀 Leapfrog | Per-doc threads, named, LCM-backed |
| Clear history | ✅ Adopt | Plus per-thread option |
| Streaming responses | 🚀 Leapfrog | SSE token streaming vs dump |
| Loading state | 🚀 Leapfrog | Three-dot pulse + "Searching KB..." status |
| Insert at cursor | ✅ Adopt (v0.1) | With formatting preserved |
| Diff preview | 🚀 Leapfrog (v0.2) | Accept/Reject per section |
| Copy button | ✅ Adopt | Table stakes |
| Minimal bottom bar | ✅ Adopt | Clean pattern |
| Disclaimer text | ➡️ Skip | Internal tool, unnecessary |

---

## Competitive Summary

Gemini sidebar is a capable **generic document assistant** with good UX bones (panel sizing, mode concept, source transparency) but fundamentally limited by:

1. No persistent memory — every session starts fresh
2. No domain knowledge — completely generic prompts and no KB
3. No automatic grounding — users manually add sources every time
4. No real doc editing — "copy this back yourself" is the UX
5. No streaming — dump-on-complete only

Our sidebar is a **Filmio-domain expert** that:
- Knows the full KB automatically (87 docs, auto-searched)
- Remembers conversations per doc via LCM
- Streams responses in real time
- Applies edits directly (v0.2)
- Generates context-aware suggestions

The Gemini sidebar is a good reference for UX patterns. It is not a competitor for what we're building.
