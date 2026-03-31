# System Architecture — The Good Life App

> Last updated: 2026-03-31

---

## 1. Architecture Overview

### Current (MVP)

```
[React SPA] --> [localStorage]
```

Single-page application. All data client-side. No server.

### Target (V1)

```
[React SPA] --> [FastAPI Backend] --> [PostgreSQL]
                      |
                [Auth Service]
                [Sync Service]
```

### Target (V2)

```
[React SPA / PWA]
       |
[API Gateway]
       |
  +---------+---------+---------+
  |         |         |         |
[Auth]  [Core API] [Groups] [Analytics]
  |         |         |         |
  +----[PostgreSQL]----+---------+
              |
       [Redis Cache]
       [Job Queue]
```

---

## 2. Current Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | React 18 | Functional components + hooks |
| Build | Vite 5 | Fast HMR, PWA plugin |
| Routing | React Router v6 | Client-side routing |
| Styling | Tailwind CSS 3.3 | + CSS custom properties for theming |
| Animation | Framer Motion 12 | Page transitions, micro-interactions |
| Dates | date-fns 2.30 | Date formatting and calculation |
| IDs | uuid 9.0 | Client-side ID generation |
| Storage | localStorage | Debounced writes (300ms) via `useStorage` hook |
| Deployment | Vercel | Static SPA hosting |
| PWA | vite-plugin-pwa | Service worker + manifest |

---

## 3. Frontend Architecture

### Component Hierarchy

```
App
├── OnboardingWizard (first-time only)
├── IntroGuide (post-onboarding)
├── Layout (persistent shell)
│   ├── Header
│   ├── TabBar (bottom navigation)
│   └── Page Content
│       ├── Dashboard
│       ├── TodayPage
│       ├── WeeklyPage
│       ├── CalendarPage
│       ├── FastingPage
│       ├── DevotionalPage
│       └── SettingsPage
```

### State Management

Currently: Props drilling from App.jsx with `useStorage` hook.

**V1 migration path:** Extract to context providers or lightweight state manager (Zustand recommended) to support:
- Optimistic updates
- Sync status indicators
- Offline-first with background sync

### Data Flow (Current)

```
User Action -> Component Handler -> useStorage hook -> localStorage
                                         |
                                   Debounce (300ms)
                                         |
                                   Write to storage
```

### Data Flow (V1 Target)

```
User Action -> Component -> State Manager -> Local Cache (IndexedDB)
                                    |
                              Sync Service (background)
                                    |
                              FastAPI Backend -> PostgreSQL
```

---

## 4. Backend Architecture (V1 — Planned)

### Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| API | FastAPI | Async, fast, Python ecosystem |
| ORM | SQLAlchemy 2.0 (async) | Proven, flexible |
| Database | PostgreSQL | Relational data, JSONB for flexibility |
| Auth | Magic link + JWT | Matches existing VVFlow pattern |
| Migrations | Alembic | Schema versioning |

### API Structure

```
/api/v1/
├── /auth
│   ├── POST /magic-link      (request login link)
│   └── POST /verify           (exchange token for JWT)
├── /users
│   └── GET /me                (current user profile)
├── /investments
│   ├── GET /today             (today's investments)
│   ├── POST /                 (log investment)
│   └── DELETE /:id            (remove investment)
├── /ratings
│   ├── GET /:date             (ratings for date)
│   └── PUT /:date             (set ratings for date)
├── /reflections
│   ├── GET /:date             (reflections for date)
│   └── PUT /:date             (set reflections for date)
├── /analytics
│   ├── GET /weekly            (weekly summary)
│   └── GET /trends            (long-term trends)
├── /fasting
│   ├── GET /                  (fasting history)
│   ├── POST /                 (start fast)
│   └── PUT /:id               (update/complete fast)
├── /disciplines
│   ├── GET /                  (user's disciplines)
│   └── POST /custom           (add custom discipline)
└── /sync
    ├── POST /push             (client -> server)
    └── GET /pull              (server -> client)
```

---

## 5. Data Sync Strategy (V1)

### Approach: Offline-First with Background Sync

1. All writes go to local storage first (IndexedDB)
2. Sync service pushes changes to server when online
3. Conflict resolution: last-write-wins with timestamps
4. Sync status shown to user (synced / pending / offline)

### Sync Protocol

```
Client                          Server
  |                               |
  |-- POST /sync/push ----------->|  (send local changes)
  |<-- 200 {server_timestamp} ----|  (acknowledge)
  |                               |
  |-- GET /sync/pull?since=T ---->|  (request changes since T)
  |<-- 200 {changes[]} -----------|  (return new data)
```

---

## 6. Security

| Concern | Approach |
|---------|----------|
| Authentication | Magic link email + JWT (HS256) |
| Authorization | All endpoints require valid JWT; users can only access own data |
| Data isolation | Every query filtered by `user_id` |
| Token expiry | Access token: 60 min, Refresh: 7 days |
| HTTPS | Enforced via Vercel / deployment platform |
| Input validation | Pydantic schemas on all endpoints |

---

## 7. Scalability Considerations

| Phase | Users | Architecture |
|-------|-------|-------------|
| MVP | 1 (local) | Client-only SPA |
| V1 | 1-1,000 | Single FastAPI server + PostgreSQL |
| V2 | 1,000-10,000 | Horizontal API scaling, connection pooling, Redis cache |
| V3 | 10,000+ | Microservices, CDN, read replicas, job queues |

### Key Decisions Deferred to V2+

- Multi-tenancy model (per-church schemas vs. shared tables)
- Real-time features (WebSocket vs. polling)
- Notification infrastructure (FCM / APNs)
- File storage (profile photos → S3/R2)

---

## 8. Deployment

### Current
- Frontend: Vercel (static)
- Backend: None

### V1 Target
- Frontend: Vercel
- Backend: Railway or Fly.io (FastAPI)
- Database: Managed PostgreSQL (Railway / Supabase / Neon)

### V2 Target
- Frontend: Vercel + CDN
- Backend: Containerized (Docker) on managed platform
- Database: Managed PostgreSQL with read replicas
- Cache: Redis (Upstash or managed)
- Jobs: Background worker (Celery or ARQ)
