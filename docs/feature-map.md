# Feature Map — The Good Life App

> Last updated: 2026-03-31

---

## Feature Status Legend

| Symbol | Meaning |
|--------|---------|
| SHIPPED | Live in current build |
| PLANNED | Designed, not yet built |
| FUTURE | Conceptual, deferred |

---

## MVP (Shipped)

| # | Feature | Capital Mapping | Status | Surface |
|---|---------|----------------|--------|---------|
| 1 | Dashboard with daily overview | All | SHIPPED | `/` |
| 2 | Five capital progress rings | All | SHIPPED | Dashboard |
| 3 | Daily discipline tracking | All | SHIPPED | `/today` |
| 4 | Capital self-rating (1-5) | All | SHIPPED | `/today` |
| 5 | Daily reflections / journaling | All | SHIPPED | `/today` |
| 6 | Weekly analytics (completion + ratings) | All | SHIPPED | `/week` |
| 7 | Daily scripture rotation (365+) | Spiritual | SHIPPED | `/devotional` |
| 8 | Devotional reflection journaling | Spiritual | SHIPPED | `/devotional` |
| 9 | Fasting tracker with timer | Spiritual / Physical | SHIPPED | `/fasting` |
| 10 | Calendar with event management | All | SHIPPED | `/calendar` |
| 11 | Custom discipline creation | All | SHIPPED | Settings |
| 12 | Capital toggle (enable/disable) | All | SHIPPED | Settings |
| 13 | Onboarding wizard (4-step) | — | SHIPPED | First launch |
| 14 | Intro guide (3-slide) | — | SHIPPED | Post-onboarding |
| 15 | Dark / Light theme | — | SHIPPED | Settings |
| 16 | Data export / import (JSON) | — | SHIPPED | Settings |
| 17 | Data reset with confirmation | — | SHIPPED | Settings |
| 18 | Profile (name + photo) | — | SHIPPED | Settings |
| 19 | Accountability partners list | Relational | SHIPPED | Settings |
| 20 | Discipline-level streaks | All | SHIPPED | Dashboard |
| 21 | Active streaks display | All | SHIPPED | Dashboard |
| 22 | Up-next disciplines | All | SHIPPED | Dashboard |
| 23 | PWA support (installable) | — | SHIPPED | — |

---

## V1 (Planned)

| # | Feature | Capital Mapping | Status | Notes |
|---|---------|----------------|--------|-------|
| 24 | Backend API (FastAPI) | — | PLANNED | Server-side persistence |
| 25 | User accounts (magic link auth) | — | PLANNED | Email-based login |
| 26 | Cloud data persistence | — | PLANNED | PostgreSQL |
| 27 | localStorage migration tool | — | PLANNED | One-time import to cloud |
| 28 | Smart insights | All | PLANNED | Pattern detection: "Your Spiritual capital drops on Fridays" |
| 29 | Capital-level streaks | All | PLANNED | Streak per capital, not just discipline |
| 30 | Alignment score | All | PLANNED | Composite score reflecting priority order |
| 31 | Accountability sharing | Relational | PLANNED | Share weekly summary with partners |
| 32 | Weekly email digest | All | PLANNED | Optional recap email |
| 33 | Offline-first sync | — | PLANNED | IndexedDB + background push/pull |

---

## V2 (Future)

| # | Feature | Capital Mapping | Status | Notes |
|---|---------|----------------|--------|-------|
| 34 | Push notifications / reminders | — | FUTURE | Daily check-in, streak warnings |
| 35 | Church admin dashboard | — | FUTURE | Aggregate view for pastors |
| 36 | Church onboarding | — | FUTURE | Church-branded experience |
| 37 | Small groups | Relational | FUTURE | Group goals + shared tracking |
| 38 | Group challenges | All | FUTURE | "21-day prayer challenge" |
| 39 | Monthly / quarterly reports | All | FUTURE | Long-term trend analysis |
| 40 | Alignment over time graph | All | FUTURE | Visual priority order health |
| 41 | Scripture reading plans | Spiritual | FUTURE | Multi-day guided plans |
| 42 | Prayer requests (shared) | Spiritual / Relational | FUTURE | Group prayer board |
| 43 | Giving integration | Financial | FUTURE | Link to church giving platform |
| 44 | Health app integration | Physical | FUTURE | Apple Health / Google Fit |
| 45 | Multi-language support | — | FUTURE | i18n |

---

## Feature-to-Capital Heat Map

Shows which capitals each phase emphasizes:

| Capital | MVP | V1 | V2 |
|---------|-----|----|----|
| Spiritual | High | High | High |
| Relational | Medium | High | High |
| Physical | Medium | Medium | Medium |
| Intellectual | Medium | Medium | Medium |
| Financial | Low | Low | Medium |

**Observation:** Financial capital has the least feature depth — intentional per priority order, but V2 should address giving integration.

---

## Decision Filter Applied

Every feature above was evaluated against:

> "Does this help the user live the good life by investing in the right things in the right order?"

Features rejected during planning:

| Rejected Feature | Reason |
|-----------------|--------|
| Social feed / timeline | Encourages comparison, not formation |
| Points / gamification | Reduces investment to a game |
| Leaderboards | Inverts focus from self to others |
| AI-generated devotionals | Replaces Scripture with generated content |
| Habit frequency customization | Makes it a habit tracker, not a formation system |
