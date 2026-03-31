# Product Specification — The Good Life App

> Last updated: 2026-03-31

---

## 1. Product Vision

A Spiritual Operating System that helps users live the good life by investing in the right things in the right order — across five capital accounts.

**Not** a habit tracker. **Not** a Bible app. A formation system.

---

## 2. Target Users

### Primary
- Individual believers seeking daily spiritual formation and life alignment
- Members of Movement Church (initial audience)

### Secondary (V2+)
- Small groups and accountability partners
- Church leadership (group analytics)
- Other churches adopting the framework

---

## 3. Core Concept: Five Capitals

All activity in the app maps to one of five capital accounts, always in priority order:

| Priority | Capital | Color | Core Question |
|----------|---------|-------|---------------|
| 1 | Spiritual | Gold (#D4A843) | Am I investing in my relationship with God? |
| 2 | Relational | Coral (#E07B6A) | Am I investing in people? |
| 3 | Physical | Green (#5BB98B) | Am I stewarding my body? |
| 4 | Intellectual | Blue (#6B8DE3) | Am I growing my mind? |
| 5 | Financial | Purple (#B07EE0) | Am I stewarding my resources? |

---

## 4. Core System Loop

```
Track -> Reflect -> Adjust -> Grow
```

| Phase | What it means | App surface |
|-------|---------------|-------------|
| **Track** | Log daily investments (disciplines) | Today page |
| **Reflect** | Rate capitals, journal | Reflections + Ratings |
| **Adjust** | See trends, identify misalignment | Weekly view + Insights |
| **Grow** | Build streaks, deepen formation | Dashboard + Long-term analytics |

---

## 5. Current State (MVP — Shipped)

### What's Built

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard | Complete | Daily greeting, 5 capital rings, streaks, scripture |
| Today (daily tracker) | Complete | Check disciplines, rate capitals (1-5), reflections |
| Weekly analytics | Complete | Completion %, average ratings, daily breakdown |
| Calendar | Complete | Monthly view + custom event management |
| Fasting tracker | Complete | Active timer, history, biblical resources |
| Devotional | Complete | 365+ rotating scriptures + reflection journaling |
| Settings | Complete | Profile, capital toggles, custom disciplines, theme, partners list, export/import |
| Onboarding | Complete | 4-step wizard + intro guide |
| Custom disciplines | Complete | User-defined disciplines per capital |
| Data export/import | Complete | Full JSON backup/restore |

### Current Limitations

- **No backend** — 100% localStorage, single device only
- **No authentication** — single-user, no accounts
- **No cloud sync** — data lives only in the browser
- **No sharing** — accountability partner list exists but has no sharing mechanism
- **No notifications** — users must open the app manually
- **No long-term analytics** — weekly view only

---

## 6. Default Disciplines

### Spiritual
- Bible Reading, Prayer, Worship, Fasting, Meditation on Scripture

### Relational
- Serving Others, Fellowship/Community, Encouraging Someone, Family Time

### Physical
- Exercise, Rest/Sleep, Healthy Eating, Outdoor Time

### Intellectual
- Reading/Study, Learning Something New, Creative Work, Planning/Strategy

### Financial
- Giving/Tithing, Budgeting, Generosity, Saving

Users can add custom disciplines and toggle capitals on/off.

---

## 7. Scoring Model

| Metric | Calculation | Scope |
|--------|-------------|-------|
| Daily completion | # completed disciplines / # enabled disciplines | Per day |
| Capital score | # completed in capital / # total in capital | Per capital per day |
| Capital rating | User self-rating 1-5 | Per capital per day |
| Streak | Consecutive days a discipline was completed | Per discipline |
| Weekly trend | Average completion % across the week | Per capital per week |

---

## 8. Language Standards

The app uses intentional language to reinforce formation over productivity.

| Concept | Use | Avoid |
|---------|-----|-------|
| Activities | "Investments" / "Disciplines" | "Tasks" / "Habits" / "To-dos" |
| Progress | "Growth" / "Alignment" | "Productivity" / "Output" |
| Effort | "Invest" / "Steward" | "Grind" / "Hustle" |
| Tracking | "Formation" | "Tracking" (where possible) |

---

## 9. V1 Requirements (Next Phase)

1. **Backend API** — FastAPI + PostgreSQL for persistent storage
2. **User accounts** — Email-based auth (magic link)
3. **Cloud sync** — All data persisted server-side
4. **Smart insights** — Pattern detection across capitals
5. **Capital-based streaks** — Streak logic at the capital level, not just discipline
6. **Accountability sharing** — Share progress with partners

---

## 10. V2 Requirements (Future)

1. **Church integration** — Church admin dashboard, group creation
2. **Group systems** — Small group tracking and shared goals
3. **Advanced analytics** — Monthly/quarterly trends, alignment scoring
4. **Push notifications** — Daily reminders, streak warnings
5. **Multi-device sync** — Seamless cross-device experience
