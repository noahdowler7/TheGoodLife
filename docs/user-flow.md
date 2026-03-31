# User Flows — The Good Life App

> Last updated: 2026-03-31

---

## 1. First-Time User Flow

```
App Launch
    |
    v
[Onboarding Wizard]
    |
    ├── Step 1: Welcome (intro to Five Capitals)
    ├── Step 2: Enter Name
    ├── Step 3: Select Capitals to Track
    └── Step 4: Profile Photo (optional)
    |
    v
[Intro Guide - 3 slides]
    |
    ├── Slide 1: Five Capitals explained
    ├── Slide 2: Daily Rhythms
    └── Slide 3: Your Journey
    |
    v
[Dashboard] (daily experience begins)
```

---

## 2. Daily Core Loop

This is the primary user journey — repeated daily.

```
Open App
    |
    v
[Dashboard]
    |
    ├── See today's progress (5 capital rings)
    ├── See active streaks
    ├── See daily scripture
    └── See up-next disciplines
    |
    v
[Today Page] (tap "Today" tab)
    |
    ├── TRACK: Check off completed disciplines
    │       (grouped by capital, priority order)
    |
    ├── REFLECT: Rate each capital (1-5 scale)
    |
    └── REFLECT: Write reflection per capital
    |
    v
[Return to Dashboard]
    |
    └── Updated rings, streaks, insights
```

### Core Loop Mapping

| Phase | Action | Screen |
|-------|--------|--------|
| **Track** | Check off disciplines | Today |
| **Reflect** | Rate capitals + journal | Today |
| **Adjust** | Review weekly trends | Weekly |
| **Grow** | See streaks + progress | Dashboard |

---

## 3. Weekly Review Flow

```
[Weekly Page] (tap "Week" tab)
    |
    ├── [Overview Tab]
    │       └── Daily breakdown grid
    │           (each day shows discipline completion)
    |
    └── [Trends Tab]
            └── Per-capital stats:
                ├── Completion % for the week
                └── Average rating for the week
```

---

## 4. Devotional Flow

```
[Devotional Page] (tap from Dashboard or tab)
    |
    ├── Today's Scripture (rotated from 365+ verses)
    ├── Reflection Prompt
    └── [Write Reflection]
    |
    v
    Saved to today's devotional reflection
    |
    └── [Archive] View past 7 days of entries
```

---

## 5. Fasting Flow

```
[Fasting Page]
    |
    ├── [Start New Fast]
    │       ├── Select fast type
    │       ├── Set start time
    │       └── Begin timer
    |
    ├── [Active Fast]
    │       ├── Live countdown timer
    │       ├── Add notes
    │       └── Complete / Cancel
    |
    └── [History]
            └── Past fasting records
```

---

## 6. Calendar Flow

```
[Calendar Page]
    |
    ├── Monthly grid view
    │       └── Day cells show discipline completion indicators
    |
    ├── [Tap Day] -> Day detail
    │       └── Events for that day + discipline summary
    |
    └── [Add Event]
            ├── Title
            ├── Date
            ├── Type (church, fasting, milestone, community, personal)
            ├── Time (optional)
            └── Notes (optional)
```

---

## 7. Settings Flow

```
[Settings Page]
    |
    ├── Profile
    │       ├── Edit name
    │       └── Change profile photo
    |
    ├── Capitals
    │       └── Toggle capitals on/off
    |
    ├── Custom Disciplines
    │       ├── Add new discipline to a capital
    │       └── Remove custom discipline
    |
    ├── Appearance
    │       └── Dark / Light mode toggle
    |
    ├── Accountability Partners
    │       ├── Add partner (name + color)
    │       └── Remove partner
    |
    ├── Data
    │       ├── Export (download JSON)
    │       ├── Import (upload JSON)
    │       └── Reset (with double confirmation)
    |
    └── About
```

---

## 8. V1 — New User Flows (Planned)

### Authentication Flow

```
[App Launch]
    |
    ├── [Has Account?]
    │       ├── YES -> [Enter Email] -> [Magic Link Sent] -> [Check Email] -> [Verify] -> [Dashboard]
    │       └── NO -> [Create Account]
    |
    v
[Create Account]
    ├── Enter Email
    ├── Magic Link Sent
    ├── Verify Link
    └── -> [Onboarding Wizard] -> [Dashboard]
```

### Data Migration Flow (existing users)

```
[First Login After V1 Update]
    |
    ├── Detect localStorage data
    |
    v
[Migration Prompt]
    "We found existing data on this device. Import it to your account?"
    |
    ├── YES -> Upload to server -> Clear local -> Continue
    └── SKIP -> Start fresh (local data preserved but unused)
```

### Accountability Sharing Flow

```
[Settings > Partners]
    |
    ├── [Select Partner]
    │       └── [Share Weekly Summary]
    │               ├── Generate summary card
    │               └── Send via link / email
    |
    └── [Invite Partner to App]
            └── Send invite link
```

---

## 9. Navigation Structure

### Tab Bar (Bottom)

| Position | Tab | Route | Icon Context |
|----------|-----|-------|-------------|
| 1 | Dashboard | `/` | Home / Overview |
| 2 | Today | `/today` | Daily investments |
| 3 | Weekly | `/week` | Trends |
| 4 | Calendar | `/calendar` | Monthly view |
| 5 | Settings | `/settings` | Profile + config |

### Secondary Navigation (from Dashboard)

| Entry Point | Destination |
|-------------|------------|
| Scripture card | `/devotional` |
| Fasting card | `/fasting` |
| Quick action grid | Various |

---

## 10. Screen-to-System-Loop Mapping

| Screen | Track | Reflect | Adjust | Grow |
|--------|-------|---------|--------|------|
| Dashboard | | | | View progress, streaks |
| Today | Check disciplines | Rate + journal | | |
| Weekly | | | Review trends | |
| Devotional | | Scripture reflection | | |
| Fasting | Log fast | | | |
| Calendar | | | Plan ahead | |
| Settings | | | Configure | |
