# Build Phases — V1 Launch (Backend Live + End-to-End Working)

> Sonnet execution guide. All V1 code is written — these phases get it **running, tested, and deployed**.
> Read this file before each phase. Execute only. No redesign.

---

## Pre-requisites

- Project: `/Users/macbook/Project AI/PA/TheGoodLife/`
- Backend code: `backend/app/` — all routers, models, schemas, services complete
- Frontend code: `src/` — auth, migration, dual-mode data layer complete
- Need: Python 3.9+, PostgreSQL 14+, Node 18+

---

## PHASE 1 — Python Environment + Dependencies

**Goal:** Working Python venv with all packages installed

**Steps:**
1. Create virtual environment in `backend/`:
   ```
   cd backend
   python3 -m venv venv
   ```
2. Activate and install:
   ```
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Create `backend/.env` from `.env.example`:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/thegoodlife
   SECRET_KEY=<generate-random-64-char-string>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   MAGIC_LINK_EXPIRE_MINUTES=15
   ```
4. Create frontend `.env` in project root:
   ```
   VITE_API_URL=http://localhost:8000
   ```

**Verify:** `python -c "import fastapi; print(fastapi.__version__)"` prints version

---

## PHASE 2 — PostgreSQL Setup + Alembic Migration

**Goal:** Database created, all 11 tables exist

**Steps:**
1. Create PostgreSQL database:
   ```
   createdb thegoodlife
   ```
   (Or if using psql: `CREATE DATABASE thegoodlife;`)

2. Verify `backend/app/models/__init__.py` imports ALL models. It must import:
   - User, UserSettings (from user)
   - Capital, DefaultDiscipline (from capital)
   - Investment (from investment)
   - Rating (from rating)
   - Reflection (from reflection)
   - FastingRecord (from fasting)
   - CalendarEvent (from event)
   - CustomDiscipline (from discipline)
   - AccountabilityPartner (from partner)

3. Verify `backend/alembic/env.py` imports `Base` from `app.database` and all models from `app.models`

4. Generate initial migration:
   ```
   cd backend
   source venv/bin/activate
   alembic revision --autogenerate -m "initial schema"
   ```

5. Apply migration:
   ```
   alembic upgrade head
   ```

6. If autogenerate misses anything, check that all unique constraints, indexes, and CHECK constraints from `database-schema.md` are present. Fix the migration file manually if needed.

**Verify:** Connect to database and confirm all 11 tables exist:
```
psql thegoodlife -c "\dt"
```

Should show: users, user_settings, capitals, default_disciplines, investments, ratings, reflections, fasting_records, calendar_events, custom_disciplines, accountability_partners, alembic_version

---

## PHASE 3 — Seed Reference Data

**Goal:** `capitals` and `default_disciplines` tables populated with immutable reference data

**Create:** `backend/app/seed.py`

This is a standalone script that seeds the database. Run once.

**Capitals seed data (from `database-schema.md`):**

| id | label | priority | color | icon |
|----|-------|----------|-------|------|
| spiritual | Spiritual Capital | 1 | #D4A843 | cross |
| relational | Relational Capital | 2 | #E07B6A | heart |
| physical | Physical Capital | 3 | #5BB98B | activity |
| intellectual | Intellectual Capital | 4 | #6B8DE3 | book |
| financial | Financial Capital | 5 | #B07EE0 | dollar |

**Default disciplines seed data (from `src/utils/capitals.js`):**

| id | capital_id | label | sort_order |
|----|-----------|-------|------------|
| bible-reading | spiritual | Bible Reading | 1 |
| prayer | spiritual | Prayer | 2 |
| worship | spiritual | Worship | 3 |
| fasting | spiritual | Fasting | 4 |
| meditation | spiritual | Meditation on Scripture | 5 |
| serving | relational | Serving Others | 1 |
| fellowship | relational | Fellowship / Community | 2 |
| encouraging | relational | Encouraging Someone | 3 |
| family-time | relational | Family Time | 4 |
| exercise | physical | Exercise | 1 |
| rest-sleep | physical | Rest / Sleep | 2 |
| healthy-eating | physical | Healthy Eating | 3 |
| outdoor-time | physical | Outdoor Time | 4 |
| reading-study | intellectual | Reading / Study | 1 |
| learning | intellectual | Learning Something New | 2 |
| creative-work | intellectual | Creative Work | 3 |
| planning | intellectual | Planning / Strategy | 4 |
| giving-tithing | financial | Giving / Tithing | 1 |
| budgeting | financial | Budgeting | 2 |
| generosity | financial | Generosity | 3 |
| saving | financial | Saving | 4 |

**Script pattern:**
```python
# backend/app/seed.py
import asyncio
from app.database import async_session_maker, engine
from app.models.capital import Capital, DefaultDiscipline

async def seed():
    async with async_session_maker() as db:
        # Check if already seeded
        # Insert capitals
        # Insert default_disciplines
        await db.commit()

if __name__ == "__main__":
    asyncio.run(seed())
```

**Run:** `cd backend && python -m app.seed`

**Verify:** `psql thegoodlife -c "SELECT * FROM capitals ORDER BY priority;"` shows 5 rows

---

## PHASE 4 — Backend Smoke Test

**Goal:** Start uvicorn, test every endpoint category manually

**Steps:**
1. Start backend:
   ```
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. Test health:
   ```
   curl http://localhost:8000/api/v1/health
   ```
   Expected: `{"status":"ok"}`

3. Test auth flow:
   ```
   # Step 1: Request magic link
   curl -X POST http://localhost:8000/api/v1/auth/magic-link \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   # Returns: {"token": "eyJ..."}

   # Step 2: Verify token
   curl -X POST http://localhost:8000/api/v1/auth/verify \
     -H "Content-Type: application/json" \
     -d '{"token":"<token-from-step-1>"}'
   # Returns: {"access_token": "eyJ...", "token_type": "bearer"}
   ```

4. Test authenticated endpoint:
   ```
   curl http://localhost:8000/api/v1/users/me \
     -H "Authorization: Bearer <access-token>"
   ```

5. Test investments (create + read):
   ```
   curl -X POST http://localhost:8000/api/v1/investments/ \
     -H "Authorization: Bearer <access-token>" \
     -H "Content-Type: application/json" \
     -d '{"date":"2026-03-31","discipline_id":"prayer","capital_id":"spiritual","completed":true}'

   curl http://localhost:8000/api/v1/investments/today \
     -H "Authorization: Bearer <access-token>"
   ```

6. Fix any errors that come up. Common issues to watch for:
   - Import errors (missing `__init__.py` or circular imports)
   - Schema validation errors (Pydantic field mismatches)
   - SQL errors (column type mismatches vs model definitions)
   - Foreign key violations (e.g. capital_id not in capitals table — seed data must exist)
   - Async session errors (missing `await` or wrong session pattern)

**Verify:** All 5 test steps return expected responses with no 500 errors

---

## PHASE 5 — Fix Backend Bugs

**Goal:** Every router endpoint works correctly end-to-end

**Approach:** Systematically hit every endpoint and fix what breaks. This is the debugging phase.

**Test each router in order:**
1. `auth.py` — magic-link + verify (tested in Phase 4)
2. `users.py` — GET /me, PUT /me
3. `investments.py` — GET /today, POST /, DELETE /:id
4. `ratings.py` — GET /:date, PUT /:date
5. `reflections.py` — GET /:date, PUT /:date
6. `fasting.py` — GET /, POST /, PUT /:id
7. `disciplines.py` — GET /, POST /custom, DELETE /custom/:id
8. `events.py` — GET /, POST /, PUT /:id, DELETE /:id
9. `analytics.py` — GET /weekly, GET /trends
10. `sync.py` — POST /push, GET /pull

**For each endpoint:**
- Send a valid request → expect 200
- Send a request with bad data → expect 422 (validation error)
- Send without auth → expect 401

**Common bug patterns to fix:**
- `func.cast(Investment.completed, func.Integer())` — may need `sqlalchemy.Integer` instead of `func.Integer()`
- `result.scalar()` vs `result.scalars().all()` confusion
- Missing `await` on async queries
- Pydantic V2 model_config issues (if using newer Pydantic)
- Date parsing format mismatches between frontend camelCase and backend snake_case

**Verify:** Create a simple test script `backend/test_endpoints.sh` that hits all endpoints in sequence. All return 2xx status codes.

---

## PHASE 6 — End-to-End Integration Test

**Goal:** Frontend + backend working together in the full auth → track → sync loop

**Steps:**
1. Start backend: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`
2. Start frontend: `npm run dev` (from project root)
3. Open `http://localhost:5173`

**Test the full user journey:**

1. **Auth Screen** appears → enter email → get magic token → verify → redirected past auth gate
2. **Data Migration** prompt appears (if localStorage data exists) → test both Import and Skip paths
3. **Onboarding** flow → complete all steps
4. **Dashboard** loads → capitals display, scripture shows
5. **Today** (`/today`) → toggle some disciplines → verify they persist (reload page)
6. **Ratings** → rate capitals → verify they persist
7. **Reflections** → write a reflection → verify persistence
8. **Calendar** → create an event → verify it appears
9. **Fasting** → start a fast → verify tracking
10. **Settings** → change theme, toggle capitals → verify persistence
11. **Analytics** (`/week`) → verify weekly data shows

**Fix issues found:**
- CORS errors → check `main.py` allow_origins includes `http://localhost:5173`
- API call failures → check frontend `api.js` base URL matches backend
- Data format mismatches → frontend sends camelCase, backend expects snake_case (or vice versa)
- Auth token not attaching → check `api.js` reads correct localStorage key

**Verify:** Complete the full journey with no console errors. Data persists across page refreshes.

---

## PHASE 7 — Frontend Insights Widgets (Phase 9-10 UI)

**Goal:** Wire the backend insights/streaks/alignment services into the frontend Dashboard

**Create:**
```
src/components/InsightsCard.jsx      # Display pattern insights on Dashboard
src/components/AlignmentWidget.jsx   # Alignment score display
```

**Modify:**
- `src/components/Dashboard.jsx` — Add InsightsCard and AlignmentWidget below existing widgets
- Wire to `GET /api/v1/analytics/trends` for insights, streaks, alignment data

**InsightsCard:**
- Fetches insights from API on mount
- Shows each insight with icon based on severity (warning, info)
- Priority inversion warnings use the warning style
- "No reflections" uses the info style

**AlignmentWidget:**
- Circular score display (0-100)
- Color changes based on score range: green (80+), yellow (60-79), orange (40-59), red (<40)
- Shows interpretation text below score
- Shows period ("Last 7 days")

**Streaks update:**
- Dashboard already shows discipline-level streaks
- Add capital-level streaks from `/api/v1/analytics/trends` response
- Show alongside existing streak display

**Fallback:** If API unavailable (offline/unauthenticated), hide these widgets gracefully — they require backend data.

**Verify:** Dashboard shows insights, alignment score, and capital streaks when backend is running and user has data.

---

## PHASE 8 — Production Config + Deployment Prep

**Goal:** Ready to deploy backend (Railway/Render) + update frontend (Vercel)

**Backend changes:**

1. Create `backend/Procfile`:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

2. Create `backend/runtime.txt`:
   ```
   python-3.11
   ```

3. Update `backend/app/main.py` CORS:
   ```python
   origins = [
       "http://localhost:5173",          # Local dev
       "https://thegoodlife.vercel.app", # Production (update with actual URL)
       os.environ.get("FRONTEND_URL", ""),
   ]
   ```

4. Update `backend/app/config.py`:
   - Add `frontend_url: str = ""` field
   - Ensure `database_url` works with both local and production connection strings

5. Add `backend/.gitignore`:
   ```
   venv/
   .env
   __pycache__/
   *.pyc
   ```

**Frontend changes:**

1. Update `vercel.json` or add env var `VITE_API_URL` in Vercel dashboard pointing to deployed backend URL

**Deployment steps (manual — not automated by Sonnet):**

1. Push code to GitHub
2. Create Railway/Render project → connect GitHub repo → set `backend/` as root
3. Add PostgreSQL addon
4. Set environment variables: `DATABASE_URL`, `SECRET_KEY`, `FRONTEND_URL`
5. Deploy → verify health check at `https://<backend-url>/api/v1/health`
6. Run seed script on production database (one-time)
7. Update Vercel env var `VITE_API_URL` to production backend URL
8. Redeploy frontend

**Verify:**
- `https://<backend-url>/api/v1/health` returns `{"status":"ok"}`
- Frontend at Vercel can login, track disciplines, and data persists

---

## Execution Notes for Sonnet

1. **One phase per prompt.** Say: "Execute Phase N"
2. **Phase 1-3** are setup. They involve running shell commands.
3. **Phase 4-6** are testing + debugging. Expect back-and-forth.
4. **Phase 7** is new frontend code.
5. **Phase 8** is config changes for deployment.
6. **Phases 4-6 will find bugs.** This is expected. Fix them in place.
7. **Don't skip phases.** Phase 4 will fail without Phase 3. Phase 6 will be chaos without Phase 5.
8. **No explanations needed** — just output code and commands.
