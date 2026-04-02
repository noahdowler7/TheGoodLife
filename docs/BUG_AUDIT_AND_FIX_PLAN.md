# TheGoodLife — Bug Audit & Fix Plan

**Date:** April 2, 2026
**Scope:** Full audit of frontend + backend

---

## Critical (Fix Immediately)

| # | Issue | File | Fix |
|---|---|---|---|
| 1 | `echo=True` logs all SQL in production | `backend/app/database.py:5` | Set `echo=False` |
| 2 | No error handling on Resend email send | `backend/app/routers/auth.py:48-54` | Wrap httpx call in try/except |
| 3 | Missing unique constraint on User.email | `backend/app/models/user.py` | Add `unique=True` to email column |

## High Priority

| # | Issue | File | Fix |
|---|---|---|---|
| 4 | No debounce on partner search — fires API on every keystroke | `src/components/Settings.jsx` | Add 300ms debounce |
| 5 | `alert()` used for errors — blocks app | `src/components/Settings.jsx` | Replace with inline toast/banner |
| 6 | Auth recovery clears token on any error (not just 401) | `src/hooks/useAuth.js:15-21` | Only clear on 401, not network errors |
| 7 | Import data overwrites everything without warning | `src/components/Settings.jsx:177-193` | Show confirmation before overwrite |
| 8 | No rate limiting on magic link endpoint | `backend/app/routers/auth.py` | Add basic rate limit (5/email/hour) |
| 9 | DB connections can go stale — no pool_pre_ping | `backend/app/database.py` | Add `pool_pre_ping=True, pool_recycle=3600` |
| 10 | Duplicate user refresh calls in auth | `backend/app/routers/auth.py:18-33` | Remove extra refresh, single commit |

## Medium Priority

| # | Issue | File | Fix |
|---|---|---|---|
| 11 | No offline/error state for sync failures | `src/components/SyncStatus.jsx` | Show error after failed retries |
| 12 | SyncStatus polls every 2s via setInterval | `src/components/SyncStatus.jsx` | Use online/offline events |
| 13 | Console errors logged but user sees nothing | Multiple files | Add error boundary or toast |
| 14 | Touch targets under 44px (Apple minimum) | Navigation icons | Increase tap area via padding |
| 15 | Procfile seeds on every deploy | `backend/Procfile` | Already idempotent, add error handling |
| 16 | No graceful DB shutdown | `backend/app/main.py` | Add shutdown event handler |
| 17 | Reflection content has no length limit | Backend model | Add max 5000 char validation |
| 18 | PWA has no offline fallback for API routes | `vite.config.js` | Add NetworkFirst strategy for /api/* |
| 19 | Form inputs not disabled during submit | `src/components/AuthScreen.jsx` | Disable fields while loading |

## Low Priority (Polish)

| # | Issue | File | Fix |
|---|---|---|---|
| 20 | Input text visibility (known issue) | `src/components/AuthScreen.jsx` | Proper CSS fix for dark/light |
| 21 | Movement logo in dark mode (known issue) | Logo component | Theme-aware logo variant |
| 22 | Native `confirm()` dialogs | `src/components/Settings.jsx` | Custom confirmation modal |
| 23 | No magic link expiry countdown | `AuthScreen.jsx` | Add 15-min timer display |
| 24 | Missing null check on customDisciplines | `src/utils/capitals.js` | Default to empty array |

---

## Fix Order

**Batch 1 — Critical + Quick wins (30 min)**
- #1 echo=True, #2 email error handling, #3 unique email, #9 pool_pre_ping, #10 duplicate refresh

**Batch 2 — UX polish (45 min)**
- #4 debounce search, #5 replace alerts, #6 auth recovery, #19 disable inputs

**Batch 3 — Robustness (30 min)**
- #7 import confirmation, #11 sync error state, #12 sync polling, #16 graceful shutdown

**Batch 4 — Mobile + Accessibility (20 min)**
- #14 touch targets, #20 input visibility, #24 null check
