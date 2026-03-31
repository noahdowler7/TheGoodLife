# Database Schema — The Good Life App

> Last updated: 2026-03-31

---

## 1. Current State (localStorage)

All data stored as JSON in browser localStorage with these keys:

| Key | Shape | Purpose |
|-----|-------|---------|
| `thegoodlife_disciplines` | `{ "YYYY-MM-DD": { "discipline-slug": bool } }` | Daily discipline completion |
| `thegoodlife_ratings` | `{ "YYYY-MM-DD": { "capital-id": 1-5 } }` | Daily capital ratings |
| `thegoodlife_reflections` | `{ "YYYY-MM-DD": { "capital-id": "text", "devotional": "text" } }` | Daily reflections |
| `thegoodlife_events` | `[{ id, date, title, type, time, notes }]` | Calendar events |
| `thegoodlife_fasting` | `[{ id, date, type, startTime, endTime, notes, completed }]` | Fasting records |
| `thegoodlife_partners` | `[{ id, name, color, createdAt }]` | Accountability partners |
| `thegoodlife_custom_disc` | `[{ id, label, capitalId }]` | Custom disciplines |
| `thegoodlife_settings` | `{ theme, capitals, currentUser, profilePicture, onboarding, introGuide }` | App settings |

---

## 2. Target Schema (V1 — PostgreSQL)

### Entity Relationship

```
users
  |
  ├── user_settings (1:1)
  ├── investments (1:many)
  ├── ratings (1:many)
  ├── reflections (1:many)
  ├── fasting_records (1:many)
  ├── calendar_events (1:many)
  ├── custom_disciplines (1:many)
  └── accountability_partners (1:many)

capitals (reference table — 5 rows, immutable)
  |
  ├── default_disciplines (1:many)
  ├── investments (FK)
  ├── ratings (FK)
  └── reflections (FK)
```

---

### Table: `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, default gen | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login identifier |
| display_name | VARCHAR(100) | | User's name |
| profile_photo_url | TEXT | | Optional |
| created_at | TIMESTAMPTZ | NOT NULL, default now | |
| updated_at | TIMESTAMPTZ | NOT NULL, default now | |

---

### Table: `capitals` (Reference)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | VARCHAR(20) | PK | e.g. "spiritual" |
| label | VARCHAR(50) | NOT NULL | e.g. "Spiritual Capital" |
| priority | SMALLINT | NOT NULL, UNIQUE | 1-5 (1 = highest) |
| color | VARCHAR(7) | NOT NULL | Hex color |
| icon | VARCHAR(50) | | Icon identifier |

**Seed data (immutable):**

| id | label | priority | color |
|----|-------|----------|-------|
| spiritual | Spiritual Capital | 1 | #D4A843 |
| relational | Relational Capital | 2 | #E07B6A |
| physical | Physical Capital | 3 | #5BB98B |
| intellectual | Intellectual Capital | 4 | #6B8DE3 |
| financial | Financial Capital | 5 | #B07EE0 |

---

### Table: `default_disciplines` (Reference)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | VARCHAR(50) | PK | Slug, e.g. "bible-reading" |
| capital_id | VARCHAR(20) | FK -> capitals.id | |
| label | VARCHAR(100) | NOT NULL | Display name |
| sort_order | SMALLINT | NOT NULL | Within capital |

---

### Table: `user_settings`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| user_id | UUID | PK, FK -> users.id | |
| theme | VARCHAR(10) | DEFAULT 'light' | 'light' or 'dark' |
| enabled_capitals | JSONB | DEFAULT all enabled | `{"spiritual": true, ...}` |
| onboarding_complete | BOOLEAN | DEFAULT false | |
| intro_guide_seen | BOOLEAN | DEFAULT false | |

---

### Table: `custom_disciplines`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id, NOT NULL | |
| capital_id | VARCHAR(20) | FK -> capitals.id, NOT NULL | |
| label | VARCHAR(100) | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, default now | |

**Unique constraint:** `(user_id, capital_id, label)`

---

### Table: `investments`

The core tracking table. One row per discipline per day per user.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id, NOT NULL | |
| date | DATE | NOT NULL | |
| discipline_id | VARCHAR(50) | NOT NULL | Default or custom slug |
| capital_id | VARCHAR(20) | FK -> capitals.id, NOT NULL | |
| completed | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, default now | |
| updated_at | TIMESTAMPTZ | NOT NULL, default now | |

**Unique constraint:** `(user_id, date, discipline_id)`
**Index:** `(user_id, date)` for daily queries

---

### Table: `ratings`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id, NOT NULL | |
| date | DATE | NOT NULL | |
| capital_id | VARCHAR(20) | FK -> capitals.id, NOT NULL | |
| score | SMALLINT | NOT NULL, CHECK 1-5 | |
| created_at | TIMESTAMPTZ | NOT NULL, default now | |

**Unique constraint:** `(user_id, date, capital_id)`

---

### Table: `reflections`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id, NOT NULL | |
| date | DATE | NOT NULL | |
| capital_id | VARCHAR(20) | FK -> capitals.id, NULL | NULL for devotional reflections |
| type | VARCHAR(20) | NOT NULL | 'capital' or 'devotional' |
| content | TEXT | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, default now | |
| updated_at | TIMESTAMPTZ | NOT NULL, default now | |

**Unique constraint:** `(user_id, date, capital_id, type)`

---

### Table: `fasting_records`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id, NOT NULL | |
| date | DATE | NOT NULL | |
| fast_type | VARCHAR(30) | NOT NULL | e.g. "full", "partial", "daniel" |
| start_time | TIMESTAMPTZ | | |
| end_time | TIMESTAMPTZ | | |
| notes | TEXT | | |
| completed | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL, default now | |

---

### Table: `calendar_events`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id, NOT NULL | |
| date | DATE | NOT NULL | |
| title | VARCHAR(200) | NOT NULL | |
| event_type | VARCHAR(20) | NOT NULL | church, fasting, milestone, community, personal |
| time | TIME | | Optional |
| notes | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL, default now | |

---

### Table: `accountability_partners`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK -> users.id, NOT NULL | Owner |
| partner_user_id | UUID | FK -> users.id, NULL | NULL if partner not on platform |
| name | VARCHAR(100) | NOT NULL | Display name |
| color | VARCHAR(7) | | UI color |
| created_at | TIMESTAMPTZ | NOT NULL, default now | |

---

## 3. Migration Strategy (localStorage -> PostgreSQL)

1. User creates account (email + magic link)
2. App detects existing localStorage data
3. One-time migration prompt: "Import your existing data?"
4. Client sends all localStorage data to `/api/v1/sync/push`
5. Server creates records, returns confirmation
6. Client clears localStorage, switches to API mode

---

## 4. V2 Schema Extensions (Planned)

### `churches`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR | |
| slug | VARCHAR | Unique URL-safe |
| created_at | TIMESTAMPTZ | |

### `church_members`
| Column | Type | Notes |
|--------|------|-------|
| church_id | UUID | FK |
| user_id | UUID | FK |
| role | VARCHAR | 'member', 'leader', 'admin' |

### `groups`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| church_id | UUID | FK |
| name | VARCHAR | |
| type | VARCHAR | 'small_group', 'accountability' |

### `group_members`
| Column | Type | Notes |
|--------|------|-------|
| group_id | UUID | FK |
| user_id | UUID | FK |
| joined_at | TIMESTAMPTZ | |
