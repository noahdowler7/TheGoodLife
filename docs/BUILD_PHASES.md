# Build Phases — The Good Life App V1

> Sonnet execution guide. Each phase is self-contained.
> Read this file + referenced docs before each phase.
> Do NOT redesign. Do NOT over-engineer. Execute only.

---

## Pre-requisites

- Project: `/Users/macbook/Project AI/PA/TheGoodLife/`
- Current: React 18 + Vite 5 SPA, localStorage only, no backend
- Target: Add FastAPI backend + PostgreSQL, keep frontend working throughout
- Docs: `/docs/architecture.md`, `/docs/database-schema.md`, `/docs/feature-map.md`

---

## PHASE 1 — Backend Scaffold

**Goal:** Empty FastAPI project that runs, with folder structure matching `/docs/architecture.md`

**Create:**
```
TheGoodLife/backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, health check
│   ├── config.py             # Settings (env vars: DATABASE_URL, SECRET_KEY, etc.)
│   ├── database.py           # Async SQLAlchemy engine + session
│   ├── models/
│   │   ├── __init__.py
│   │   └── base.py           # Base model class
│   ├── routers/
│   │   └── __init__.py
│   ├── schemas/
│   │   └── __init__.py
│   ├── services/
│   │   └── __init__.py
│   └── dependencies/
│       └── __init__.py
├── alembic/
│   ├── env.py
│   └── versions/
├── alembic.ini
├── requirements.txt
└── .env.example
```

**Details:**
- `main.py`: FastAPI app with CORS allowing `http://localhost:5173`, health endpoint `GET /api/v1/health`
- `config.py`: Pydantic BaseSettings loading from `.env` — fields: `database_url`, `secret_key`, `algorithm=HS256`, `access_token_expire_minutes=60`, `magic_link_expire_minutes=15`
- `database.py`: async engine with `create_async_engine`, `async_sessionmaker`, `get_db` dependency
- `requirements.txt`: fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, alembic, pydantic-settings, python-jose[cryptography], passlib, python-multipart, httpx
- Alembic configured for async

**Verify:** `uvicorn app.main:app --reload` returns `{"status": "ok"}` at `/api/v1/health`

---

## PHASE 2 — Database Models + Migration

**Goal:** All 11 tables from `/docs/database-schema.md` as SQLAlchemy models, with initial Alembic migration

**Create in `app/models/`:**
```
models/
├── __init__.py         # Import all models
├── base.py             # Already exists
├── user.py             # users, user_settings
├── capital.py          # capitals, default_disciplines (reference)
├── investment.py       # investments
├── rating.py           # ratings
├── reflection.py       # reflections
├── fasting.py          # fasting_records
├── event.py            # calendar_events
├── discipline.py       # custom_disciplines
└── partner.py          # accountability_partners
```

**Rules:**
- Match column types/constraints EXACTLY from `database-schema.md`
- All UUIDs use `uuid.uuid4` as default
- All timestamps use `func.now()`
- Unique constraints and indexes as documented
- `capitals` and `default_disciplines` are reference tables — create seed data in migration

**Run:** `alembic revision --autogenerate -m "initial schema"` then `alembic upgrade head`

---

## PHASE 3 — Auth System

**Goal:** Magic link + JWT auth, matching VVFlow pattern from memory

**Create:**
```
app/schemas/auth.py       # MagicLinkRequest, TokenResponse
app/services/auth.py      # create_magic_token, verify_magic_token, create_access_token
app/routers/auth.py       # POST /magic-link, POST /verify
app/dependencies/auth.py  # get_current_user_id (JWT decode from Authorization header)
```

**Endpoints:**
- `POST /api/v1/auth/magic-link` — accepts `{email}`, creates user if not exists, returns magic token (for now just return token in response; email sending deferred)
- `POST /api/v1/auth/verify` — accepts `{token}`, returns `{access_token, token_type}`

**Pattern:** Same as VVFlow — `get_current_user_id` dependency extracts user_id from JWT, raises 401 if invalid

**Register:** auth router in `main.py` at `/api/v1`

---

## PHASE 4 — Core CRUD Routers

**Goal:** All API endpoints from `/docs/architecture.md` section 4

**Create routers:**
```
app/routers/
├── auth.py           # Already from Phase 3
├── users.py          # GET /me, PUT /me
├── investments.py    # GET /today, POST /, DELETE /:id
├── ratings.py        # GET /:date, PUT /:date
├── reflections.py    # GET /:date, PUT /:date
├── fasting.py        # GET /, POST /, PUT /:id
├── disciplines.py    # GET /, POST /custom, DELETE /custom/:id
├── events.py         # GET /, POST /, PUT /:id, DELETE /:id
└── analytics.py      # GET /weekly, GET /trends (stub)
```

**Create schemas (Pydantic) in `app/schemas/`:**
- One schema file per router
- Request + Response models
- Match database-schema.md types

**Create services in `app/services/`:**
- One service file per domain
- All queries filter by `user_id`
- Async SQLAlchemy queries

**Rules:**
- Every endpoint requires auth: `user_id: uuid.UUID = Depends(get_current_user_id)`
- Read-only endpoints use `_user_id` (underscore prefix, still enforces auth)
- Register all routers in `main.py` under `/api/v1`

---

## PHASE 5 — Sync Endpoint + Migration Tool

**Goal:** Enable frontend to push localStorage data to backend

**Create:**
```
app/routers/sync.py       # POST /push, GET /pull
app/services/sync.py      # Bulk import logic
app/schemas/sync.py       # SyncPushRequest (all 8 localStorage shapes), SyncPullResponse
```

**POST /api/v1/sync/push:**
- Accepts full localStorage dump (disciplines, ratings, reflections, events, fasting, partners, custom_disciplines, settings)
- Upserts all records for the authenticated user
- Returns `{status: "ok", counts: {investments: N, ratings: N, ...}}`

**GET /api/v1/sync/pull?since=TIMESTAMP:**
- Returns all user data modified since timestamp
- Used for incremental sync

---

## PHASE 6 — Frontend Auth Layer

**Goal:** Add auth screens + token management to React app WITHOUT breaking existing localStorage flow

**Create:**
```
src/services/api.js        # Axios/fetch wrapper with JWT token, base URL config
src/services/auth.js       # login(email), verify(token), logout(), getToken(), isAuthenticated()
src/hooks/useAuth.js       # Auth state hook (token, user, loading)
src/components/AuthScreen.jsx  # Login/signup screen (email input + magic link flow)
```

**Modify:**
- `App.jsx`: Add auth gate — if not authenticated, show AuthScreen; if authenticated, show existing app
- Keep ALL existing localStorage logic working (no breaking changes)
- Store JWT in localStorage key `thegoodlife_token`
- Store user profile in localStorage key `thegoodlife_user`

**Config:**
- `src/services/api.js`: `API_BASE_URL` from env var `VITE_API_URL` (default `http://localhost:8000`)

---

## PHASE 7 — Data Migration UI

**Goal:** One-time prompt for existing users to upload localStorage data to server

**Create:**
```
src/components/DataMigration.jsx   # Migration prompt + progress
```

**Flow (from user-flow.md):**
1. After first successful login, check if localStorage has data (`thegoodlife_disciplines` exists and non-empty)
2. Show prompt: "We found existing data on this device. Import it to your account?"
3. YES → call `POST /api/v1/sync/push` with all localStorage data → show success → clear localStorage data keys (keep token/user)
4. SKIP → set flag `thegoodlife_migrated=skipped`, continue

**Integrate:** Add migration check in `App.jsx` after auth, before showing dashboard

---

## PHASE 8 — Frontend API Integration

**Goal:** Dual-mode data layer — API when authenticated, localStorage when offline/unauthenticated

**Create:**
```
src/services/dataService.js    # Unified CRUD that routes to API or localStorage
```

**Modify:**
- `src/hooks/useStorage.js`: Add API-aware mode. When authenticated + online, read/write through API. When offline, use localStorage and queue for sync.
- Keep debounce behavior for localStorage fallback
- Add simple sync status: `synced | pending | offline`

**Key principle:** App works identically in both modes. Authenticated users get cloud persistence. Unauthenticated users get localStorage (current behavior).

---

## PHASE 9 — Smart Insights (Feature #28)

**Goal:** Pattern detection engine that surfaces alignment insights

**Backend:**
```
app/services/insights.py   # Analyze user data, detect patterns
app/routers/analytics.py   # Flesh out GET /weekly and GET /trends
```

**Frontend:**
```
src/components/InsightsCard.jsx   # Display insight on Dashboard
```

**Insight types:**
- "Your [capital] investment drops on [day]"
- "You've invested more in [capital] than [capital] this week" (priority inversion warning)
- "[Capital] has been your strongest investment for [N] weeks"
- "You haven't reflected on [capital] in [N] days"

**Rule:** Insights must reinforce priority order. If Financial > Spiritual, flag it.

---

## PHASE 10 — Capital-Level Streaks + Alignment Score (Features #29, #30)

**Backend:**
```
app/services/streaks.py      # Capital-level streak calculation
app/services/alignment.py    # Composite alignment score
```

**Frontend:**
- Update Dashboard to show capital-level streaks (not just discipline)
- Add Alignment Score widget — composite score reflecting whether investments follow priority order

**Alignment Score formula:**
- Weight each capital by its priority position (Spiritual=5x, Relational=4x, Physical=3x, Intellectual=2x, Financial=1x)
- Score = weighted completion / max possible weighted completion
- Higher score = better aligned to priority order

---

## Execution Notes for Sonnet

1. **One phase per prompt.** Say: "Execute Phase N"
2. **Read the referenced docs** before writing code
3. **Don't change existing files** unless the phase explicitly says "Modify"
4. **Test each phase** before moving to next
5. **No explanations needed** — just output code
6. Each phase builds on the previous. Don't skip.
