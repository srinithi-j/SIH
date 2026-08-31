# AI-Powered Societal Innovation Collaboration Portal

**Smart India Hackathon — Base MVP**

A digital platform that converts real-world societal challenges into structured, trackable
innovation projects by connecting **Citizens → Government → Universities/HEIs →
Students/Faculty → Industry/Startups/MSMEs → Communities**.

Lifecycle: **IDENTIFY → UNDERSTAND → MATCH → COLLABORATE → DEVELOP → DEPLOY → MEASURE**

> This is an SIH prototype, not a production system. AI scoring is
> deterministic/mocked but architected as a clean drop-in replacement for a
> real Sentence Transformers pipeline (see `ai-service/services/`).

---

## Architecture

```
React Web  ─────┐
Flutter Mobile ──┤
                 ▼
     Node.js + Express REST API
                 │
     ┌───────────┼───────────┐
     ▼                       ▼
 PostgreSQL          Python FastAPI (NLP / matching)
```

```
project/
├── frontend/     React + Vite + Tailwind (primary web prototype)
├── mobile/       Flutter — basic citizen "Report Challenge" flow
├── backend/      Node.js + Express REST API (JWT auth, RBAC, business logic)
├── ai-service/   Python FastAPI — challenge analysis + HEI matching
├── database/     PostgreSQL schema.sql + seed.sql
├── docker-compose.yml
└── .env.example
```

---

## Local setup prerequisites

This project expects PostgreSQL to be running locally on port 5432.
The backend connects using the following defaults:

- host: `localhost`
- port: `5432`
- database: `sih_portal`
- user: `sih_user`
- password: `sih_password`

If PostgreSQL is not yet installed or the database/user do not exist, create them before starting the app.

### Create the local PostgreSQL database and role

#### macOS / Linux
```bash
psql -U postgres
CREATE ROLE sih_user WITH LOGIN PASSWORD 'sih_password';
CREATE DATABASE sih_portal OWNER sih_user;
\q
```

#### Windows PowerShell
```powershell
psql -U postgres
CREATE ROLE sih_user WITH LOGIN PASSWORD 'sih_password';
CREATE DATABASE sih_portal OWNER sih_user;
\q
```

If `createdb` is available, the equivalent is:
```bash
createdb -U postgres -h localhost sih_portal
```

> The backend automatically runs `database/schema.sql` and `database/seed.sql` on startup, so a fresh database will be initialized with the required tables and demo data.

---

## Quick Start (local)

### 1) PostgreSQL
Make sure PostgreSQL is running locally, then create the app database if it does not already exist:

```sql
CREATE ROLE sih_user WITH LOGIN PASSWORD 'sih_password';
CREATE DATABASE sih_portal OWNER sih_user;
```

Then verify access:

```bash
psql -h localhost -U sih_user -d sih_portal
```

### 2) AI service
Use Anaconda if you already have it installed:

```bash
cd ai-service
conda create -n sih-ai python=3.11 -y
conda activate sih-ai
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

If `conda` is not recognized, open Anaconda Prompt or use the full path to `conda.exe`.

### 3) Backend
In a new terminal:

```bash
cd backend
npm install
npm run dev
```

The backend automatically initializes the database schema and demo seed data on startup.

### 4) Frontend
In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- AI service: http://localhost:8000

### 5) Optional mobile app
```bash
cd mobile
flutter pub get
flutter run
```

---

## Docker quick start

```bash
docker compose up --build
```

This starts PostgreSQL, backend, AI service, and frontend together.

---

## Demo Accounts

All seeded accounts share the password **`demo1234`**:

| Role       | Email               |
|------------|----------------------|
| Citizen    | citizen@demo.in      |
| Government | gov@demo.in           |
| University | university@demo.in    |
| Industry   | industry@demo.in      |

The login page also fetches this list live from `GET /api/auth/demo-accounts`.

---

## Demo Flow (end-to-end)

1. **Citizen** logs in → Report Challenge → submits "Unsafe drinking water in
   rural schools" → gets challenge code `CH-JH-2026-XXX` → AI analysis runs
   automatically (domain, priority, severity/impact scores, required skills).
2. **Government** logs in → Challenge Review → sees the challenge with AI
   analysis → clicks **Approve** → status becomes `VALIDATED`, and the
   backend calls the AI service's `/match-heis` endpoint to rank universities.
3. **University** logs in → Recommended Challenges → sees ranked matches with
   reasons → **Adopt & Create Project** → project is created and visible on
   the university dashboard.
4. Anyone with access to the project (`/projects/:id`) can **advance the
   lifecycle** (Team Formation → Prototype → Testing → Pilot → Deployment →
   Completed).
5. **Industry** logs in → sees projects seeking support → **Express
   Interest / Offer Mentorship / Provide Resources**.
6. Once a project reaches Deployment, impact metrics (already seeded for the
   demo project) are shown distinctly from "Project Completed."
7. **Government** → Analytics — a full command dashboard with live counts
   pulled from Postgres.

The seed data (`database/seed.sql`) pre-populates the entire flow above for
`CH-JH-2026-001` so a fresh clone already has a fully worked example, even
before anyone clicks a button.

---

## API Overview (backend, prefixed `/api`)

| Area        | Endpoints |
|-------------|-----------|
| Auth        | `POST /auth/login`, `GET /auth/me`, `GET /auth/demo-accounts` |
| Challenges  | `POST /challenges` (citizen submit), `GET /challenges`, `GET /challenges/:id`, `POST /challenges/:id/review` (gov) |
| University  | `GET /university/dashboard`, `GET /university/recommended`, `POST /university/challenges/:id/adopt`, `POST /university/projects` |
| Industry    | `GET /industry/projects`, `POST /industry/projects/:id/interest` |
| Projects    | `GET /projects/:id`, `PATCH /projects/:id/status`, `POST /projects/:id/impact` |
| Analytics   | `GET /analytics/government` |

## AI Service Endpoints (FastAPI, prefixed none — runs standalone on :8000)

| Endpoint | Purpose |
|----------|---------|
| `POST /analyze` | Domain classification + priority/severity/impact scoring |
| `POST /similar` | Duplicate/similarity detection (stub — returns empty list; wire up a corpus + embeddings to activate) |
| `POST /match-heis` | Ranks demo universities against a challenge's requirements |

Swap points for real NLP are clearly commented in
`ai-service/services/analysis.py` and `ai-service/services/matching.py`.

---

## What's intentionally NOT in this base MVP

- Maps (location is stored as text fields — district/block/village)
- WebSockets (REST + manual refresh only)
- Real Sentence Transformers model loaded (mocked but architecture-ready)
- Production cloud deployment / CI-CD
- Real image upload (placeholder field only)

These are natural next steps once the base is stable.

---

## Contributing (team workflow)

Suggested branch structure:
```
main
develop
feature/citizen
feature/ai
feature/government
feature/university
feature/industry-impact
feature/mobile
```

Guidelines:
- Branch off `develop`, open PRs back into `develop`; `main` stays deployable.
- Keep the three services (frontend / backend / ai-service) independently
  runnable — don't introduce cross-service imports.
- Backend: one controller per resource, one route file per resource,
  business logic stays in controllers/services (not in routes).
- Frontend: one page per route, shared UI in `src/components/`, no
  page-to-page prop drilling — use `AuthContext` or fetch from the API.
- AI service: keep mock scoring functions swappable — if you wire in a real
  model, keep the same input/output shape defined in `models/schemas.py`.
- Any new DB table/column → update `database/schema.sql` (and add seed rows
  to `database/seed.sql` if it helps the demo).

---

## Environment Variables

See `backend/.env.example`, `frontend/.env.example`, and the root
`.env.example` for the full list. Defaults are pre-wired for local dev and
for `docker-compose up`.
# SIH
