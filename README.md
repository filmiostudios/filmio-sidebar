# Filmio AI Sidebar

A Chrome extension that brings KB-powered AI assistance directly into Google Docs — without leaving the document.

## What it does

- **Persistent chat** alongside any Google Doc — full conversation history via LCM, not just session memory
- **KB-aware responses** — answers grounded in Filmio's knowledge base via Vertex AI Search
- **Inline edits** — agent can write directly into the document at your cursor
- **Streaming responses** — real-time output, no waiting for full reply
- **Role-filtered context** — each team member sees only docs they have Drive access to

## Status

🚧 In development — v0.1 (MVP) in progress

## Architecture

```
Chrome Extension (MV3)
├── Side Panel (React + Tailwind)     ← persistent chat UI
├── Content Script                    ← reads doc context, applies edits
└── Background Service Worker         ← manages auth, session routing

Backend (existing Filmio infrastructure)
├── OC Sessions via /hooks/agent      ← persistent named sessions
├── Vertex AI Search (87 KB docs)     ← grounded retrieval
├── KB Relationship Map               ← doc navigation context
└── Query Understanding Classifier    ← intent routing
```

## Development

### Prerequisites
- Node 20+
- Chrome 114+ (Side Panel API)
- Access to Filmio OC infrastructure

### Setup
```bash
npm install
npm run dev        # watches src/, outputs to dist/
```

### Load extension
1. Chrome → `chrome://extensions` → Developer mode ON
2. "Load unpacked" → select `dist/` folder
3. Open any Google Doc → click sidebar icon

### Build
```bash
npm run build      # production bundle
```

## Docs
- [PRD](docs/PRD.md) — what we're building and why
- [Architecture](docs/ARCHITECTURE.md) — technical design
- [CLAUDE.md](CLAUDE.md) — agent coding instructions

## Roadmap
- v0.1: Chat panel + streaming + KB search
- v0.2: Inline edits applied to doc
- v0.3: Persistent history across sessions (LCM)
- v0.4: Multi-doc context, team handoffs
