# AI Prompts & Conversation Log - ABTalks Autonomous AI Creator

This document records the prompt history, AI engineering interactions, problem statements, and resolution strategies used during the development of **ABTalks — Autonomous AI Creator & Content Engine** for the hackathon challenge.

---

## Conversation & Development Milestones

### Prompt 1: Initial Post Formatting & Persona Badging
- **User Prompt**: Fix UI text formatting and persona display badges on the live post feed.
- **AI Action**: Added rich markdown text rendering (`renderFormattedText`) for headers (`🚀`, `💡`, `📌`, `🔗`), bullet points (`•`, `-`), bold/italic formatting, and dynamic persona badge rendering (`personaId.name`) in `LiveFeed.tsx` and `Dashboard.tsx`.
- **Commit**: `fix(ui): rich markdown text formatting and persona badge display for live feed`

### Prompt 2: Dynamic Persona Profile Editing
- **User Prompt**: Allow users to dynamically edit and save persona profile settings directly in the UI.
- **AI Action**: Connected `PersonaProfile.tsx` to `/api/v1/persona` endpoints, allowing interactive voice style, target audience, and domain customization with active state toggles.
- **Commit**: `feat(persona): allow user to dynamically edit and save persona settings in UI`

### Prompt 3: Topic Discovery Sorting Controls
- **User Prompt**: Add sorting controls to Topic Discovery page by editorial score vs recency.
- **AI Action**: Added interactive sorting state toggles (`Score (High → Low)` vs `Recency (Newest)`) with status filtering (`All`, `Approved`, `Rejected`) in `TopicDiscovery.tsx`.
- **Commit**: `feat(ui): add sort toggle by score vs recency in TopicDiscovery`

### Prompt 4: Long-Term Vector Memory & Deduplication
- **User Prompt**: Fix duplicate post publication by integrating vector memory history.
- **AI Action**: Updated `runDirectAutonomousCycle` in `backend/src/controllers/agent.controller.ts` and `seed_cycle.ts` to query past `MemoryModel` and `PostModel` records and forward `pastMemories` embeddings to the Python FastAPI AI service for cosine similarity check (`> 0.82`).
- **Commit**: `fix(dedup): pass pastMemories vector history to prevent duplicate post publication`

### Prompt 5: Live Candidate Badge & Manual Refresh
- **User Prompt**: Add live candidate badge, manual refresh button, and empty state UI to Topic Discovery.
- **AI Action**: Added an interactive "Refresh Queue" button with spinning state and empty state cards in `TopicDiscovery.tsx`.
- **Commit**: `feat(ui): add live candidate badge, refresh button, and empty state UI to TopicDiscovery`

### Prompt 6: Live Feed Page Refresh & Caching Resolution
- **User Prompt**: `"not seeing latesr post when i refresh it"` / `"same problem latest feed not showing when i refresh it"`
- **Problem Statement**:
  1. Browser HTTP response caching was serving 304 Not Modified or stale GET responses for `/api/v1/agent/feed`.
  2. Direct cycle executions (`/agent/init`) did not emit `AUTONOMOUS_CYCLE_COMPLETED` over Socket.IO.
  3. `LiveFeed.tsx` only fetched data on component mount and did not listen to real-time socket events.
  4. Static RSS fallback topics caused repeated semantic duplicate rejections.
- **AI Engineering Resolution**:
  - **Backend (`agent.controller.ts`, `post.controller.ts`)**: Added HTTP headers `Cache-Control: no-cache, no-store, must-revalidate, max-age=0`, `Pragma: no-cache`, `Expires: 0`.
  - **Socket Server (`server.ts`, `agent.controller.ts`)**: Exposed `app.set('io', io)` and emitted `AUTONOMOUS_CYCLE_COMPLETED` upon direct task execution.
  - **Frontend Client (`api.client.ts`)**: Appended dynamic timestamp cache busters (`_t=${Date.now()}`) to feed API requests.
  - **LiveFeed Component (`LiveFeed.tsx`)**: Subscribed component lifecycle to Socket.IO `lastEvent` and added a manual "Refresh Feed" button.
  - **AI Discovery Engine (`feed_parser.py`)**: Added dynamic timestamps to fallback RSS topics.
- **Commit**: `fix(feed): resolve feed refresh caching, missing socket events, and enable real-time feed updates`

---

### Prompt 8: Hackathon Autonomy Alignment & Evaluator API Refactoring
- **User Prompt**: Refactor existing codebase to achieve 100% compliance with the ABTalks Autonomous AI Creator Hackathon Challenge. Ensure `/api/agent/init` starts an autonomous background worker and returns `{"agentId": "..."}` immediately, and `/api/agent/feed?agentId=...` returns top-level `{"posts": [...]}` with ISO-8601 UTC timestamps, 3-question rationale, and source links.
- **Problem Statement**:
  1. `/api/agent/init` expected a Mongo ObjectId `personaId` rather than accepting `{"persona": {"name": "Ada", "domain": "AI Security"}}`.
  2. Background worker relied solely on BullMQ/Redis; if Redis was offline, it did not continue running periodic cycles autonomously in Node.js.
  3. Feed response wrapped array in `{ success: true, data: [...] }` instead of top-level `{ "posts": [...] }`.
  4. Posts lacked 3-part rationale answering why selected, why relevant now, and why chosen over candidates.
- **AI Engineering Resolution**:
  - **Backend (`agent.model.ts`, `agent.controller.ts`, `scheduler.service.ts`)**: Created `AgentModel`, implemented Node.js `setInterval` fallback loop manager (`schedulerService`), and auto-resumed active agents on server startup (`server.ts`).
  - **API Contract (`agent.controller.ts`, `routes/index.ts`)**: Updated `POST /api/agent/init` to return `{ "agentId": agentId }` immediately and updated `GET /api/agent/feed` to return top-level `{ "posts": [...] }`.
  - **AI Microservice (`feed_parser.py`, `scoring_matrix.py`, `gemini_client.py`)**: Expanded RSS sources, updated 7-metric editorial matrix (`threshold >= 7.0`), configured **Ada** persona prompt, and mandated 3-part rationale structure.
  - **Frontend Dashboard (`Dashboard.tsx`, `App.tsx`, `EvaluatorSimulation.tsx`)**: Redesigned home view with visual pipeline (`DISCOVER → JUDGE → REMEMBER → CREATE → PUBLISH`), real-time activity stream, public access, and interactive Evaluator API Panel.

- **Commit**: `feat(hackathon): 100% hackathon compliance with autonomous scheduler, evaluator API contract, and Ada persona`

---

## AI Architecture Summary

```
                       ┌────────────────────────────────────────┐
                       │           React + Vite Frontend        │
                       │     (Real-Time Socket.IO & Feed UI)    │
                       └───────────────────┬────────────────────┘
                                           │
                                 HTTP GET / POST (_t=timestamp)
                                           │
                       ┌───────────────────▼────────────────────┐
                       │        Node.js / Express Gateway       │
                       │   (Background Autonomous Scheduler)   │
                       └───────────┬────────────────┬───────────┘
                                   │                │
                         MongoDB   │                │ HTTP POST
                        Persistence│                │ /api/v1/agent/execute
                                   │                │
                       ┌───────────▼──────┐  ┌──────▼───────────────────┐
                       │   MongoDB Atlas  │  │   Python FastAPI AI      │
                       │ (Agents, Posts,  │  │  (7-Metric Scoring,      │
                       │ Vector Memory)   │  │   Gemini 1.5 Synthesis)  │
                       └──────────────────┘  └──────────────────────────┘
```
