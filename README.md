# VedaAI — AI Assessment Creator

A full-stack web app that lets a teacher create an assignment, generate a structured question paper with AI (queued background job), watch live progress over WebSocket, and download a polished PDF.

Built for the **VedaAI Full Stack Engineering Assignment**.

> This workspace is maintained on the `veda-ai-features` branch for incremental updates and verification.

---

## Highlights / Bonus features

- ✅ AI question generation with **structured JSON parsing** (LLM response is never rendered raw)
- ✅ **Background job queue** (BullMQ + Redis) — API returns immediately, worker processes async
- ✅ **WebSocket** real-time progress updates (queued → processing → progress % → completed)
- ✅ **Redis caching** of generated papers by prompt hash (regenerate forces fresh)
- ✅ **PDF export** via Puppeteer (proper A4 formatting, not raw HTML print)
- ✅ **Regenerate** action that re-queues with cache bypass
- ✅ **Difficulty badges** with distinct colors (Easy / Moderate / Challenging)
- ✅ **File upload** with PDF text extraction to ground LLM in source material
- ✅ **Validation** on both client & server (Zod) — no empty / negative values
- ✅ **Mobile-responsive** layout, bottom nav, glass-morphism per Figma
- ✅ **Mock LLM mode** — develop without an API key (`USE_MOCK_LLM=true`)

---

## Architecture

```
┌─────────────┐     HTTP / WS     ┌──────────────┐
│  Next.js    │ ◄───────────────► │  Express API │
│  Frontend   │                   │ + Socket.IO  │
│  (Zustand)  │                   └───────┬──────┘
└─────────────┘                           │
                                          ▼
                          ┌──────────────────────────┐
                          │  MongoDB    Redis (BullMQ│
                          │  (papers)   queue + cache│
                          └──────┬───────────────────┘
                                 │ pub/sub
                                 ▼
                          ┌──────────────┐
                          │  BullMQ      │
                          │  Worker      │
                          │  ─ LLM call  │
                          │  ─ parse JSON│
                          │  ─ persist   │
                          │  ─ publish   │
                          └──────────────┘
```

### Generation flow

1. `POST /api/assignments` validates input (Zod), saves with status `queued`, enqueues BullMQ job, emits `queued` event.
2. Worker pulls job → sets status `processing` → emits progress events.
3. Worker builds a deterministic prompt → checks Redis cache (`paper:<sha256>`).
4. On miss → calls Gemini → strips fences / extracts JSON → validates against Zod schema → stores in Mongo & Redis.
5. Worker publishes `completed` event over Redis pub/sub.
6. API server (separate process) subscribes to pub/sub and broadcasts the event to the right Socket.IO room.
7. Frontend, subscribed to `assignment:<id>`, updates the UI live.

### Why a Redis pub/sub bridge?

The worker runs as its own Node process, so it can't directly hold the Socket.IO server. The worker publishes to `assignment:events` on Redis; the API server subscribes and re-emits to the correct WebSocket rooms. This lets us horizontally scale workers and API servers independently.

### Never render raw LLM output

The LLM is constrained to return JSON that matches a strict schema. The backend parses, validates with Zod, and stores it as typed Mongo documents. The frontend renders **typed fields** (`question.text`, `question.difficulty`, etc.) — never the raw model string.

---

## Project structure

```
/Users/kuldeepraj/Veda_AI_Assignment
├── backend/                  # Node + Express + TypeScript
│   └── src/
│       ├── config/           # env, mongo, redis
│       ├── controllers/      # request handlers
│       ├── middleware/       # error handler
│       ├── models/           # Mongoose Assignment schema
│       ├── queue/            # BullMQ queue + types
│       ├── routes/           # Express routes
│       ├── services/         # LLM client, prompt builder, parser, PDF, cache, file extractor
│       ├── sockets/          # Socket.IO server + Redis pub/sub bridge
│       ├── types/            # shared TS types
│       ├── utils/            # Zod validation
│       ├── workers/          # BullMQ worker
│       └── index.ts          # Express entry
├── frontend/                 # Next.js 14 (App Router) + TypeScript
│   └── src/
│       ├── app/              # routes
│       │   ├── assignments/
│       │   │   ├── new/      # Create wizard
│       │   │   └── [id]/     # Output / detail page
│       │   ├── my-groups/
│       │   ├── library/
│       │   ├── toolkit/
│       │   └── settings/
│       ├── components/       # Sidebar, TopBar, MobileNav, CreateAssignmentForm, QuestionPaperView, etc.
│       ├── hooks/            # useAssignmentSocket
│       ├── lib/              # api client, socket client, utils
│       ├── store/            # Zustand store
│       └── types/            # shared TS types
└── package.json              # workspaces (frontend + backend)
```

---

## Setup

### Prereqs
- Node 18+ and npm 9+
- A MongoDB connection string (local Mongo or free MongoDB Atlas cluster)
- A Redis URL (local Redis or free Upstash instance)
- (Optional) A Google **Gemini API key** — free at https://aistudio.google.com/apikey. Without one the app runs against the built-in **mock LLM**.

### Install

```bash
cd /Users/kuldeepraj/Veda_AI_Assignment
npm install
```

This installs both workspaces (frontend + backend).

### Configure env

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit `backend/.env` and fill in your keys / connection strings. To use the mock LLM (no API key required), set `USE_MOCK_LLM=true` or leave `GEMINI_API_KEY` blank.

### Run (3 processes)

```bash
# Terminal 1 — API server
npm run dev:backend

# Terminal 2 — BullMQ worker
npm run worker

# Terminal 3 — Next.js
npm run dev:frontend
```

Or run frontend + API together (still need the worker separately):

```bash
npm run dev
```

Open http://localhost:3000.

### Build

```bash
npm run build
```

### Local infra (optional, via Homebrew on macOS)

```bash
brew tap mongodb/brew
brew install mongodb-community redis
brew services start mongodb-community
brew services start redis
```

---

## Deployment

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | Vercel | Set `NEXT_PUBLIC_API_URL` + `NEXT_PUBLIC_SOCKET_URL` to your backend URL |
| API + Worker | Render (or Fly.io) | Two services from the same repo: one running `npm run start:backend`, one running `npm run start:worker -w backend`. Add MONGODB_URI, REDIS_URL, GEMINI_API_KEY, CLIENT_ORIGIN as env vars. |
| MongoDB | MongoDB Atlas (free M0) | https://cloud.mongodb.com |
| Redis | Upstash (free) | https://upstash.com |

Render free tier supports both HTTP and background-worker services and keeps the WebSocket connection open.

---

## Approach

**State management.** Zustand (per assignment spec). Single store with selectors for list, draft, current assignment, and generation progress. Sockets dispatch into the same store so UI is consistent across tabs.

**WebSocket.** Socket.IO. Clients subscribe to `assignment:<id>` rooms. Worker publishes to Redis; API rebroadcasts to rooms. This decouples worker scale from socket scale.

**Validation.** Zod schemas on both sides. Server is authoritative — frontend gets `400` + flattened error tree for any invalid input. No empty / negative values reach the queue.

**LLM safety.** The prompt asks for strict JSON only; the parser strips stray markdown fences and validates against a Zod schema before persistence. If validation fails, the job is retried (BullMQ's default backoff). The UI never displays unparsed text.

**Caching.** Generated papers are cached in Redis by `sha256(prompt)`. Same input → same paper for 7 days. Regenerate sets `force: true` to bypass.

**PDF.** Puppeteer renders a server-side HTML template with proper exam-paper typography (Times New Roman, page-break-avoid sections, A4 margins). The user gets a downloadable file via `GET /api/assignments/:id/pdf`.

**UI.** Tailwind. Pixel-perfect tokens taken from the Figma file (radius 16, padding 24, shadow `0 32 48 #000020%`, white #FFFFFF, brand gradient orange `#FF6A1A → #FF8A3D`). Mobile bottom nav uses glassmorphism (`backdrop-blur-md`).

---

## API

| Method | Path | Body / Params | Notes |
|--------|------|---------------|-------|
| GET | `/health` | — | Health check |
| GET | `/api/assignments` | — | List all |
| POST | `/api/assignments` | multipart: title, subject, className, dueDate, questionTypes (JSON), additionalInstructions, file | Validates, queues job |
| GET | `/api/assignments/:id` | — | Get one |
| DELETE | `/api/assignments/:id` | — | Delete |
| POST | `/api/assignments/:id/regenerate` | — | Re-queue with cache bypass |
| GET | `/api/assignments/:id/pdf` | — | Download PDF |

### WebSocket events

Client emits:
- `subscribe`: `assignmentId` (joins room)
- `unsubscribe`: `assignmentId`

Server emits:
- `assignment:update` — `{ type: 'queued' | 'processing' | 'progress' | 'completed' | 'failed', ... }`
- `assignment:any` — broadcast for list-page refresh

---

## What's not built (deliberate scope)

- Authentication (single-school placeholder in sidebar — out of scope for this assessment).
- The peripheral nav items (My Groups, AI Teacher's Toolkit, Library, Settings) have placeholder pages.
- The Figma desktop login / onboarding screens were not provided and aren't required by the spec.

The Assignment Creator flow (create → generate → view → download → regenerate) is fully implemented and is what the assignment asked for.
