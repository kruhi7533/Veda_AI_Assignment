<div align="center">

# 🎓 VedaAI — AI Assessment Creator

### *Turn a teacher's intent into a beautifully formatted exam paper — in seconds.*

A full-stack, production-grade AI tool that lets teachers create assignments, generate structured question papers with Gemini, watch live progress over WebSocket, and download a polished PDF.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-5-EE0000)](https://docs.bullmq.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io)](https://socket.io/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> Built for the **VedaAI Full-Stack Engineering Assignment**.
> Maintained on the `veda-ai-features` branch for incremental updates and verification.

</div>

---

## 📑 Table of Contents

1. [Demo Highlights](#-demo-highlights)
2. [Why this project stands out](#-why-this-project-stands-out)
3. [Core Modules](#-core-modules)
4. [Architecture](#%EF%B8%8F-architecture)
5. [Tech Stack](#%EF%B8%8F-tech-stack)
6. [Project Structure](#-project-structure)
7. [Getting Started](#-getting-started)
8. [Environment Variables](#-environment-variables)
9. [API Reference](#-api-reference)
10. [WebSocket Events](#-websocket-events)
11. [Deployment](#-deployment)
12. [Design Decisions](#-design-decisions)
13. [What I'd Build Next](#-what-id-build-next)

---

## ✨ Demo Highlights

| Flow | What you see |
|---|---|
| 🧙 **Create Assignment** | 2-step wizard, file upload (drag & drop), live counters, voice-to-text dictation, dynamic question-type rows with steppers |
| 🤖 **AI Generation** | Job queued → worker calls Gemini → JSON parsed → progress bar animates 5% → 30% → 70% → 100% via WebSocket |
| 📄 **Output Page** | Real exam-paper layout — school header, student-info lines, sections with `[Easy]` / `[Moderate]` / `[Challenging]` color-coded badges, marks per question, answer key |
| 📥 **PDF Export** | Server-side Puppeteer render, A4, Times-New-Roman, page-break-aware — no raw HTML print |
| 🔁 **Regenerate** | One click → re-queues with cache bypass → live progress again |
| 📊 **Dashboard** | Live stats (assignments, questions, marks, groups), status donut chart, difficulty distribution, subject breakdown, recent activity |
| 🛠️ **AI Toolkit** | 3 Gemini-powered tools — Concept Explainer, Lesson Plan Generator, Rubric Builder |
| 👥 **My Groups** | Full CRUD of class groups with color-coded avatars, student & assignment counts |
| ⭐ **My Library** | Star/favourite any paper, plus 4 one-click templates that pre-fill the wizard |
| ⚙️ **Settings** | Profile, school, generation preferences (difficulty mix sliders), live system health |

---

## 🏆 Why This Project Stands Out

This isn't just *"the assignment did X, so I built X."* It's built like a real product:

### Spec compliance — every checkbox

| Requirement | Status |
|---|---|
| File upload (PDF / text) | ✅ Drag & drop, server-side PDF text extraction |
| Due date · Question types · Counts · Marks · Instructions | ✅ All wired |
| Validation — no empty / negative | ✅ 3 layers: UI + Zod (server) + Mongoose schema |
| Redux **or Zustand** state | ✅ Zustand store with selectors, used across all pages |
| WebSocket management | ✅ Socket.IO + per-assignment rooms + Redis pub-sub bridge |
| AI structured prompt → sections + difficulty + marks | ✅ Zod-validated JSON schema; raw LLM never rendered |
| Node + Express + TypeScript | ✅ |
| MongoDB → store assignments & results | ✅ Mongoose models for `Assignment` + `Group` |
| Redis → caching / job state | ✅ Paper cache keyed by `sha256(prompt)` (7-day TTL) + BullMQ job state |
| BullMQ background jobs | ✅ Separate worker process, concurrency 2, exponential retry |
| WebSocket real-time updates | ✅ 5 event types: `queued` → `processing` → `progress` → `completed` / `failed` |

### Bonus features the spec hints at — *all implemented*

- ✅ **PDF export** (Puppeteer, real A4, not browser print)
- ✅ **Action bar** with Regenerate + Save + Download
- ✅ **Difficulty badges** with distinct colors
- ✅ **Better caching** — Redis SHA-256 cache + LLM dedup

### Extras I added to win the hire

- ✨ **AI Teacher's Toolkit** — 3 additional Gemini tools (Explain · Lesson Plan · Rubric)
- ✨ **Live dashboard** with custom SVG donut chart (no chart lib bloat)
- ✨ **Voice-to-text** on the "Additional Information" field (Web Speech API)
- ✨ **My Groups** module with full CRUD + colored avatars
- ✨ **My Library** with favorites + 4 quick-start templates
- ✨ **Settings** page with live API health check
- ✨ **Mock LLM mode** — develop & demo without an API key
- ✨ **Glassmorphism mobile nav** matching the Figma exactly (blur + 5% white)
- ✨ **Color-coded terminal logger** — every request, mongo op, queue event, LLM call, cache HIT/MISS shows up with timestamp & icon

---

## 🧩 Core Modules

```
🏠 Home                    Dashboard with live stats, charts, recent activity
📝 Assignments             List + 2-step create wizard + detail/output page
🛠️ AI Teacher's Toolkit    Concept Explainer · Lesson Plan · Rubric Builder
👥 My Groups                CRUD for class groups (Mongoose + colored avatars)
📚 My Library              Favourited papers + quick-start templates
⚙️ Settings                Profile · school · preferences · system health
```

---

## 🏗️ Architecture

```
                       ┌──────────────────────────┐
                       │       Next.js 14         │
                       │  (App Router + Zustand)  │
                       │  Socket.IO client        │
                       └──────────┬───────────────┘
                                  │  HTTP + WebSocket
                                  ▼
                       ┌──────────────────────────┐
                       │   Express API (Node)     │
                       │   ├─ Zod validation      │
                       │   ├─ Socket.IO server    │
                       │   └─ Redis pub-sub sub   │
                       └────┬──────────┬──────────┘
                            │          │
                ┌───────────▼─┐     ┌─▼────────────────┐
                │  MongoDB    │     │     Redis        │
                │  (Atlas)    │     │  ┌────────────┐  │
                │  Assignment │     │  │  BullMQ    │  │
                │  Group      │     │  │  queue     │  │
                └─────────────┘     │  └────────────┘  │
                                    │  ┌────────────┐  │
                                    │  │  paper:*   │  │   ← prompt-hash cache
                                    │  └────────────┘  │
                                    │  ┌────────────┐  │
                                    │  │  pub/sub   │  │   ← worker → API bridge
                                    │  └────────────┘  │
                                    └─────┬────────────┘
                                          │
                                          ▼
                              ┌──────────────────────────┐
                              │   BullMQ Worker (Node)   │
                              │   1. fetch assignment    │
                              │   2. build prompt        │
                              │   3. Gemini API          │
                              │   4. Zod-parse JSON      │
                              │   5. persist + cache     │
                              │   6. publish events      │
                              └──────────────────────────┘
```

### Generation Flow (step-by-step)

1. `POST /api/assignments` → Zod validates → saves doc with `status: 'queued'` → enqueues BullMQ job → emits `queued` event → returns 201 in ~50ms.
2. Worker picks job → sets `status: 'processing'` → emits 10% progress.
3. Builds deterministic prompt → checks Redis cache (`paper:<sha256>`).
4. On cache MISS → calls Gemini → strips fences → validates against Zod schema → stores in Mongo & Redis.
5. Worker publishes `completed` event on Redis `assignment:events` channel.
6. API server (separate process) subscribes to that channel → re-emits to the right Socket.IO room.
7. Browser receives the event → store updates → output page renders.

### Why a Redis pub-sub bridge?

The worker runs in its **own Node process**, so it can't directly hold a reference to the Socket.IO server. Pub-sub via Redis is a clean, horizontally-scalable handshake: workers and API servers can each scale independently.

### LLM output is *never* rendered raw

The prompt asks Gemini for **strict JSON**. The backend strips stray markdown fences, runs it through a **Zod schema**, and only then persists it. The frontend renders typed fields (`question.text`, `question.difficulty`, etc.) — never the raw model string. If validation fails, BullMQ retries (exponential backoff).

---

## 🛠️ Tech Stack

### Frontend
| Tool | Why |
|---|---|
| **Next.js 14** (App Router) | File-based routing, server components, instant deploy on Vercel |
| **TypeScript** | End-to-end type safety with shared types |
| **Zustand** | Tiny, ergonomic state store — perfect for the draft + live progress |
| **Tailwind CSS** | Pixel-perfect Figma replication without CSS bloat |
| **Socket.IO Client** | Auto-reconnect, room subscribe/unsubscribe |
| **Framer Motion + Lucide** | Subtle motion + crisp icons |
| **react-hot-toast** | Friendly error / success feedback |

### Backend
| Tool | Why |
|---|---|
| **Node 20 + Express** | Familiar, battle-tested HTTP layer |
| **TypeScript** | Strict mode across the board |
| **Mongoose** | Typed schemas + indexes |
| **BullMQ** | Robust job queue with retries, backoff, concurrency |
| **ioredis** | Connection-pooled Redis client (queue + cache + pub-sub) |
| **Socket.IO** | Rooms + WebSocket fallback |
| **Zod** | Runtime validation for HTTP body, env, and LLM JSON |
| **Puppeteer** | Server-rendered PDFs |
| **@google/generative-ai** | Gemini API client |
| **pdf-parse + multer** | Extract text from uploaded PDFs |

---

## 📁 Project Structure

```
Veda_AI_Assignment/
├── backend/                          # Node + Express + TS
│   ├── src/
│   │   ├── config/                   # env, mongo, redis bootstrapping
│   │   ├── controllers/              # assignment, group, stats, toolkit
│   │   ├── middleware/               # errorHandler
│   │   ├── models/                   # Assignment, Group (Mongoose)
│   │   ├── queue/                    # BullMQ queue + connection helper
│   │   ├── routes/                   # express routers
│   │   ├── services/                 # LLM client, prompt builder, parser,
│   │   │                             # cache, PDF, file extractor, toolkit
│   │   ├── sockets/                  # Socket.IO server + Redis pub-sub bridge
│   │   ├── types/                    # shared TypeScript types
│   │   ├── utils/                    # logger, validation
│   │   ├── workers/                  # BullMQ generator worker + socket bridge
│   │   └── index.ts                  # API entry
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Next.js 14 + TS
│   ├── src/
│   │   ├── app/                      # routes (App Router)
│   │   │   ├── assignments/
│   │   │   │   ├── new/              # 2-step wizard
│   │   │   │   └── [id]/             # detail / output / regenerate
│   │   │   ├── my-groups/
│   │   │   ├── toolkit/
│   │   │   ├── library/
│   │   │   ├── settings/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # Home dashboard
│   │   ├── components/               # Sidebar, TopBar, MobileNav, AppShell,
│   │   │                             # CreateAssignmentForm, QuestionPaperView,
│   │   │                             # Dashboard, GroupsPage, ToolkitPage,
│   │   │                             # LibraryPage, SettingsPage, etc.
│   │   ├── hooks/                    # useAssignmentSocket, useVoiceInput
│   │   ├── lib/                      # api client, socket client, utils
│   │   ├── store/                    # Zustand store
│   │   ├── types/                    # shared TS types
│   │   └── styles/
│   ├── .env.example
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── package.json                      # workspaces + dev scripts
├── README.md                         # ← you are here
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node** ≥ 18 and **npm** ≥ 9
- **MongoDB** — local install or a free [MongoDB Atlas](https://cloud.mongodb.com) M0 cluster
- **Redis** — local install or a free [Upstash](https://upstash.com) instance
- *(Optional)* **Gemini API key** — free at [Google AI Studio](https://aistudio.google.com/apikey). Without one, the app uses the built-in **mock LLM**.

### 1. Clone & install

```bash
git clone <your-repo-url>
cd Veda_AI_Assignment
npm install        # installs both workspaces
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit `backend/.env` and set `GEMINI_API_KEY`, `MONGODB_URI`, `REDIS_URL`.
For a **zero-config demo**, leave `GEMINI_API_KEY` blank and the app uses the built-in mock LLM.

### 3. Run (three processes)

> ⚠️ Run each in a separate VS Code terminal so you can see the color-coded logs.

```bash
# Terminal 1 — API server (port 4000)
npm run dev:backend

# Terminal 2 — BullMQ worker
npm run worker

# Terminal 3 — Next.js (port 3000)
npm run dev:frontend
```

Then open <http://localhost:3000> 🚀

### Convenience scripts

| Command | What it does |
|---|---|
| `npm run dev` | Runs frontend + API concurrently (worker still separate) |
| `npm run build` | Compiles backend + frontend for production |
| `npm run clean:frontend` | Nukes `.next` cache if Fast Refresh breaks |
| `npm run worker` | Starts the BullMQ worker |
| `npm run start:backend` | Runs the compiled API |

### Optional — local Mongo + Redis via Homebrew (macOS)

```bash
brew tap mongodb/brew
brew install mongodb-community redis
brew services start mongodb-community
brew services start redis
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Notes |
|---|:---:|---|---|
| `PORT` | — | `4000` | API server port |
| `NODE_ENV` | — | `development` | |
| `CLIENT_ORIGIN` | ✅ | `http://localhost:3000` | CORS allow-list & Socket.IO origin |
| `MONGODB_URI` | ✅ | `mongodb://localhost:27017/vedaai` | Atlas SRV string supported. Encode `@` in password as `%40` |
| `REDIS_URL` | ✅ | `redis://localhost:6379` | Upstash `rediss://` works too |
| `GEMINI_API_KEY` | optional | — | Leave blank to use mock |
| `GEMINI_MODEL` | — | `gemini-2.5-flash` | Any chat-completions model from `?key=…&models=list` |
| `USE_MOCK_LLM` | — | auto | `true` forces mock even with a key |
| `PDF_TMP_DIR` | — | `./tmp` | |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default |
|---|:---:|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:4000` |
| `NEXT_PUBLIC_SOCKET_URL` | ✅ | `http://localhost:4000` |

---

## 📡 API Reference

Base: `http://localhost:4000`

### Health

```http
GET /health
```

### Assignments

| Method | Path | Body |
|---|---|---|
| `GET` | `/api/assignments` | — |
| `POST` | `/api/assignments` | multipart: `title, subject, className, dueDate, questionTypes (JSON), additionalInstructions, file` |
| `GET` | `/api/assignments/:id` | — |
| `DELETE` | `/api/assignments/:id` | — |
| `POST` | `/api/assignments/:id/regenerate` | — (forces cache bypass) |
| `POST` | `/api/assignments/:id/favorite` | — (toggles) |
| `GET` | `/api/assignments/:id/pdf` | — (returns PDF stream) |

### Groups

| Method | Path | Body |
|---|---|---|
| `GET` | `/api/groups` | — (returns groups + `assignmentCount`) |
| `POST` | `/api/groups` | `{ name, subject, className, studentCount?, color?, description? }` |
| `PATCH` | `/api/groups/:id` | partial group |
| `DELETE` | `/api/groups/:id` | — |

### Dashboard stats

| Method | Path |
|---|---|
| `GET` | `/api/stats/dashboard` |

### AI Toolkit (Gemini-powered)

| Method | Path | Body |
|---|---|---|
| `POST` | `/api/toolkit/explain` | `{ concept, className }` |
| `POST` | `/api/toolkit/lesson-plan` | `{ topic, subject, className, durationMinutes }` |
| `POST` | `/api/toolkit/rubric` | `{ assignmentDescription, totalPoints }` |

All toolkit endpoints return strict JSON parsed against a Zod schema.

---

## 🔌 WebSocket Events

### Client → Server
| Event | Payload | Purpose |
|---|---|---|
| `subscribe` | `assignmentId: string` | Join an assignment room for live updates |
| `unsubscribe` | `assignmentId: string` | Leave the room |

### Server → Client
| Event | Payload | When |
|---|---|---|
| `assignment:update` | `{ type, assignmentId, ... }` | Targeted to subscribers of that assignment |
| `assignment:any` | same | Broadcast — used by the list & dashboard pages |

### Event types
```ts
type AssignmentEvent =
  | { type: 'queued'; assignmentId: string }
  | { type: 'processing'; assignmentId: string; progress?: number }
  | { type: 'progress'; assignmentId: string; progress: number; message?: string }
  | { type: 'completed'; assignmentId: string; assignment: Assignment }
  | { type: 'failed'; assignmentId: string; error: string };
```

---

## 🚢 Deployment

| Component | Platform | Notes |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Set `NEXT_PUBLIC_API_URL` + `NEXT_PUBLIC_SOCKET_URL` |
| **API + Worker** | [Render](https://render.com) / Fly.io / Railway | Two services from the same repo |
| **MongoDB** | [Atlas](https://cloud.mongodb.com) free M0 | |
| **Redis** | [Upstash](https://upstash.com) free | TLS-enabled `rediss://` URL |

### Render (recommended)

The repo ships with a `render.yaml` blueprint. After importing it, Render creates two services:

- **vedaai-api** → Express + Socket.IO server (`npm run start:backend`)
- **vedaai-worker** → BullMQ worker (`npm run start:worker -w backend`)

Set these secrets on each service:

```
CLIENT_ORIGIN     = https://your-app.vercel.app
MONGODB_URI       = mongodb+srv://...
REDIS_URL         = rediss://default:...@...upstash.io:6379
GEMINI_API_KEY    = AIza...
GEMINI_MODEL      = gemini-2.5-flash
```

Render's free tier supports both HTTP and background-worker services and keeps the WebSocket connection open.

### Vercel

```bash
vercel --prod
# Set NEXT_PUBLIC_API_URL = https://vedaai-api.onrender.com
# Set NEXT_PUBLIC_SOCKET_URL = https://vedaai-api.onrender.com
```

---

## 🧠 Design Decisions

### Why Zustand over Redux?
The spec accepts either; Zustand requires zero boilerplate, plays well with Next.js App Router, and selectors keep components reactive without re-renders. The store cleanly holds list, draft, current, and live generation progress in one place.

### Why a separate worker process?
Generation takes 2–10s (Gemini round-trip). Running it inside the HTTP request would block the event loop and risk gateway timeouts. BullMQ moves it to a background worker; the API returns 201 in ~50ms.

### Why cache by `sha256(prompt)`?
Same inputs → same paper. The cache key is the entire prompt hash, so any change (even an extra instruction) misses cache. Caching saves Gemini cost & latency for repeats.

### Why a Redis pub-sub bridge for sockets?
The worker can't hold the Socket.IO server (different process). It publishes to Redis; the API subscribes and forwards. Lets us horizontally scale workers and API servers independently — and uses the Redis we already have for the queue.

### Why never render raw LLM output?
The spec explicitly says *"Do not directly render LLM response."* Gemini is constrained with a JSON schema in the prompt, then the response is stripped of fences, parsed, and Zod-validated before persistence. The UI binds to typed fields only.

### Why Puppeteer for PDFs?
Browser print would lose alignment, ignore page breaks, and bake in print-dialog headers. Puppeteer renders a clean HTML/CSS template server-side and produces an A4 PDF identical across machines.

### Why a color-coded terminal logger?
So you (or a reviewer) can verify Mongo is connected, Redis pubsub is alive, jobs are processing, and Gemini is replying — without opening a UI. Every event is timestamped with a `[tag]` and ✓/→/ℹ/⚠/✗ symbol.


---

<div align="center">

### Built with 💛 by Ruhi · for the VedaAI Hiring Assignment

*If this README made you smile, the codebase will too.*

</div>
