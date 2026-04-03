# Build Instructions: 5 Spiritual Formation Practices

**Author:** Opus (architect)
**Executor:** Sonnet (builder)
**Date:** April 2, 2026
**Priority:** Build in order — each is small and standalone

---

## Overview

Add 5 spiritual formation practices to the app. These are ancient, proven practices that technology can uniquely enable. Each is a new component on the Dashboard or accessible from a dedicated entry point.

---

## Practice 1: Daily Examen (Ignatian Evening Review)

### What it is
A 500-year-old Jesuit practice. Each evening, the user reviews their day through 5 guided questions. Takes 3-5 minutes. This is the single most proven daily spiritual practice in church history.

### Where it lives
- Dashboard: New card between Three Pillars and Alignment Score
- Shows as a collapsible card: "Evening Examen" (appears after 5pm, but accessible anytime)
- Stores responses in `reflections[dateStr].examen`

### Component: `src/components/DailyExamen.jsx`

**5 Steps (one at a time, swipeable or next/prev):**

```javascript
const EXAMEN_STEPS = [
  {
    id: 'presence',
    title: 'God\'s Presence',
    prompt: 'Become aware that you are in God\'s presence right now. Take a deep breath. He is with you.',
    type: 'pause', // No input — just a 10-second pause with a breathing animation
  },
  {
    id: 'gratitude',
    title: 'Gratitude',
    prompt: 'What am I most grateful for today?',
    placeholder: 'Today I\'m grateful for...',
    type: 'text',
  },
  {
    id: 'review',
    title: 'Review the Day',
    prompt: 'Where did I feel closest to God today? Where did I feel furthest?',
    placeholder: 'I felt close to God when... I felt distant when...',
    type: 'text',
  },
  {
    id: 'sorrow',
    title: 'Sorrow & Confession',
    prompt: 'Is there anything I need to confess or release? Any moment I wish I could redo?',
    placeholder: 'Lord, I confess...',
    type: 'text',
  },
  {
    id: 'tomorrow',
    title: 'Looking Forward',
    prompt: 'What is God inviting me into tomorrow? What do I need from him?',
    placeholder: 'Tomorrow, I ask for...',
    type: 'text',
  },
]
```

**UX Flow:**
1. User taps "Evening Examen" card on Dashboard
2. Card expands to show Step 1 (Presence — breathing pause)
3. After 10 seconds (or tap "Next"), moves to Step 2 (Gratitude — textarea)
4. User types response, taps "Next"
5. Steps 3, 4, 5 each have a textarea
6. After Step 5, show a completion message: "Amen. Rest well tonight."
7. A small progress indicator shows 1/5, 2/5, etc.

**Data Storage:**
```javascript
reflections[dateStr].examen = {
  gratitude: "My family's health",
  review: "I felt close during morning prayer. Distant during the argument at work.",
  sorrow: "I was impatient with my kids after dinner.",
  tomorrow: "Patience and presence with my family.",
  completed: true,
}
```

**Visual Style:**
- Dark, calm, contemplative feel
- Muted colors — use `var(--bg-card)` with a subtle warm glow
- Step indicator: 5 small dots at the top
- Smooth transitions between steps (fade or slide)
- The "Presence" step should have a subtle pulsing circle (breathing guide)

### Dashboard Card
```jsx
<div className="home-card">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(212, 168, 67, 0.15)' }}>
      {/* Moon/star icon for evening */}
    </div>
    <div>
      <p className="text-[15px] font-semibold">Evening Examen</p>
      <p className="text-[13px] text-muted">
        {completed ? '✓ Completed tonight' : 'Review your day with God'}
      </p>
    </div>
  </div>
</div>
```

---

## Practice 2: Scripture Memory

### What it is
A weekly verse to memorize with flashcard-style practice. Users see the verse each day, can tap to hide/reveal it, and track which verses they've memorized over time.

### Where it lives
- Dashboard: New card (small, always visible) showing this week's memory verse
- Settings: List of memorized verses (history)
- Data comes from the existing Bible data (public/bible/)

### Component: `src/components/ScriptureMemory.jsx`

**How it works:**
1. Each week, a new verse is assigned (rotate through a curated list of 52 key verses)
2. Dashboard card shows the reference and first few words: "John 15:5 — 'I am the vine...'"
3. Tap the card → expands to full verse text
4. "Practice" button → shows reference only, user tries to recite, then taps "Reveal" to check
5. After 7 days, verse moves to "Memorized" list
6. Track streak: "12 verses memorized"

**Curated verse list (52 verses — one per week):**
```javascript
const MEMORY_VERSES = [
  { ref: 'John 15:5', book: 'jhn', chapter: 15, verse: 5 },
  { ref: 'Psalm 23:1', book: 'psa', chapter: 23, verse: 1 },
  { ref: 'Proverbs 3:5-6', book: 'pro', chapter: 3, startVerse: 5, endVerse: 6 },
  { ref: 'Philippians 4:6-7', book: 'php', chapter: 4, startVerse: 6, endVerse: 7 },
  { ref: 'Romans 8:28', book: 'rom', chapter: 8, verse: 28 },
  { ref: 'Isaiah 41:10', book: 'isa', chapter: 41, verse: 10 },
  { ref: 'Matthew 6:33', book: 'mat', chapter: 6, verse: 33 },
  { ref: 'Jeremiah 29:11', book: 'jer', chapter: 29, verse: 11 },
  { ref: 'Galatians 5:22-23', book: 'gal', chapter: 5, startVerse: 22, endVerse: 23 },
  { ref: 'Joshua 1:9', book: 'jos', chapter: 1, verse: 9 },
  { ref: 'Psalm 46:10', book: 'psa', chapter: 46, verse: 10 },
  { ref: 'Romans 12:2', book: 'rom', chapter: 12, verse: 2 },
  { ref: '2 Timothy 1:7', book: '2ti', chapter: 1, verse: 7 },
  { ref: 'Hebrews 11:1', book: 'heb', chapter: 11, verse: 1 },
  { ref: 'Psalm 119:105', book: 'psa', chapter: 119, verse: 105 },
  { ref: 'Ephesians 2:8-9', book: 'eph', chapter: 2, startVerse: 8, endVerse: 9 },
  { ref: 'James 1:5', book: 'jas', chapter: 1, verse: 5 },
  { ref: 'Micah 6:8', book: 'mic', chapter: 6, verse: 8 },
  { ref: 'Psalm 139:14', book: 'psa', chapter: 139, verse: 14 },
  { ref: '1 John 4:19', book: '1jn', chapter: 4, verse: 19 },
  { ref: 'Romans 5:8', book: 'rom', chapter: 5, verse: 8 },
  { ref: 'Colossians 3:23', book: 'col', chapter: 3, verse: 23 },
  { ref: 'Lamentations 3:22-23', book: 'lam', chapter: 3, startVerse: 22, endVerse: 23 },
  { ref: 'Matthew 11:28-30', book: 'mat', chapter: 11, startVerse: 28, endVerse: 30 },
  { ref: 'Psalm 27:1', book: 'psa', chapter: 27, verse: 1 },
  { ref: '2 Corinthians 5:17', book: '2co', chapter: 5, verse: 17 },
  // ... fill to 52 (one per week of the year)
]
```

**Fetch verse text** from the bundled Bible data using `getChapter()` from `src/utils/bible.js`.

**Data Storage:**
```javascript
// In localStorage via useStorage
settings.scripture_memory = {
  current_week: 15, // week of year
  memorized: ['John 15:5', 'Psalm 23:1', ...], // completed verses
  practiced_today: true,
}
```

**Dashboard Card (compact):**
```
┌──────────────────────────────┐
│ 📖 This Week's Verse          │
│ John 15:5                     │
│ "I am the vine; you are..."  │
│              [Practice →]     │
└──────────────────────────────┘
```

---

## Practice 3: Silence & Solitude Timer

### What it is
A guided silence practice. User sets a duration (2, 5, 10, 15, 20 min), taps "Begin", and the app provides a calm screen with a timer, a gentle bell at start and end, and an optional verse to meditate on.

### Where it lives
- Accessible from the Spiritual discipline "Meditation on Scripture" enrichment (add a "Silent Prayer" button)
- Also as a standalone card on Dashboard (optional)
- When completed, auto-marks the `meditation` discipline as complete

### Component: `src/components/SilenceTimer.jsx`

**UX Flow:**
1. Select duration: 2 / 5 / 10 / 15 / 20 min (pill buttons)
2. Optional: show a verse to hold in your heart (pulled from daily scripture)
3. Tap "Begin Silence"
4. Screen goes minimal — just a soft circular timer, the verse, and elapsed time
5. Screen stays awake (use `navigator.wakeLock` API if available)
6. Gentle visual pulse (breathing circle) — no audio during silence
7. When time completes: subtle vibration (if available) + "Amen" appears
8. "How was your time with God?" — optional one-line journal
9. Marks `meditation` discipline as complete

**Timer Display (during silence):**
```
        ┌─────────────────┐
        │                 │
        │    ◯  5:00      │  ← Soft pulsing circle + countdown
        │                 │
        │  "Be still and  │
        │   know that I   │
        │    am God."     │
        │                 │
        │   Psalm 46:10   │
        │                 │
        └─────────────────┘
```

**Visual Style:**
- Extremely minimal — almost black screen with very subtle elements
- The breathing circle: slowly expands and contracts (4s in, 4s out)
- Timer text: small, muted, non-distracting
- Verse: centered, serif font (Georgia), large, gold color
- No animations that distract from silence

**Data Storage:**
```javascript
reflections[dateStr].silence = {
  duration: 300, // seconds
  completed: true,
  note: "Felt God's peace today",
}
```

**Keep Screen Awake:**
```javascript
// Request wake lock when timer starts
let wakeLock = null
try {
  wakeLock = await navigator.wakeLock.request('screen')
} catch (e) {
  // Wake lock not supported — timer still works
}
// Release when done
wakeLock?.release()
```

---

## Practice 4: Gratitude Journal

### What it is
A simple daily practice: "Write 3 things you're grateful for today." Takes 30 seconds. Research shows this is one of the most transformative daily habits for both mental health and spiritual growth.

### Where it lives
- Dashboard: Small card that shows today's gratitude entries (or prompts to fill them)
- Stores in `reflections[dateStr].gratitude`

### Component: `src/components/GratitudeJournal.jsx`

**UX Flow:**
1. Dashboard shows a card: "What are you grateful for today?"
2. Tap to expand → 3 input fields (short text, one line each)
3. Each field has a number (1, 2, 3) and placeholder text that rotates daily:
   - "A person I'm thankful for..."
   - "Something God did today..."
   - "A small blessing I noticed..."
4. As user fills each one, a subtle checkmark appears
5. When all 3 are filled → "Grateful heart, grateful life." completion message
6. Can view past entries by date (optional — or just let it be ephemeral)

**Rotating Placeholders:**
```javascript
const GRATITUDE_PROMPTS = [
  ["A person I'm thankful for...", "Something God provided...", "A moment that made me smile..."],
  ["A blessing I don't deserve...", "Someone who showed me love...", "Something beautiful I saw..."],
  ["A prayer God answered...", "A skill or ability I have...", "A challenge that grew me..."],
  ["Something in creation I noticed...", "A relationship I value...", "A comfort I often take for granted..."],
  ["A verse that encouraged me...", "An opportunity I was given...", "Something about God's character I experienced..."],
  ["A meal I enjoyed...", "A conversation that mattered...", "A way God protected me..."],
  ["Something that made me laugh...", "A teacher or mentor in my life...", "A freedom I have..."],
]
// Rotate by day of week
```

**Data Storage:**
```javascript
reflections[dateStr].gratitude = [
  "My wife's patience with me today",
  "The sunset on the drive home",
  "That God is still working on me"
]
```

**Dashboard Card:**
```
┌──────────────────────────────────┐
│ 🙏 Grateful Today                │
│                                  │
│  1. My wife's patience           │
│  2. The sunset on the drive home │
│  3. _________________________    │
│                                  │
│     2 of 3 — keep going          │
└──────────────────────────────────┘
```

---

## Practice 5: Sabbath Check-in

### What it is
A weekly practice (shows on Sundays, or user-configured Sabbath day). Simple reflection: "How did you rest this week?" with practical suggestions for Sabbath practices.

### Where it lives
- Dashboard: Appears on the user's Sabbath day (default Sunday, configurable in Settings)
- If not their Sabbath day, shows a smaller "Sabbath in X days" countdown
- Stores in `reflections[weekStr].sabbath`

### Component: `src/components/SabbathCheckin.jsx`

**UX Flow (on Sabbath day):**
1. Dashboard shows prominent card: "It's Sabbath. How will you rest today?"
2. Quick-tap options (multiple select):
   - "No screens" 📵
   - "Time in nature" 🌿
   - "Family time" 👨‍👩‍👧‍👦
   - "Long meal" 🍽️
   - "Worship" 🎵
   - "Nap / Rest" 😴
   - "No work" ✋
3. Optional note: "How are you resting today?"
4. Evening follow-up: "How was your Sabbath?" (rate 1-5)

**UX Flow (non-Sabbath day):**
1. Small subtle card: "Sabbath in 3 days" — countdown
2. Tap for Sabbath planning suggestions

**Sabbath Suggestions (rotate weekly):**
```javascript
const SABBATH_IDEAS = [
  "Take a walk without your phone. Notice what God has made.",
  "Cook a meal from scratch. Invite someone to share it.",
  "Write a letter (on paper) to someone you love.",
  "Sit outside for 20 minutes. Don't produce. Just receive.",
  "Play a board game with your family. Laugh together.",
  "Visit a park or garden. Let creation speak to you.",
  "Read a book that has nothing to do with work.",
  "Take a long bath or shower. Pray while the water runs.",
]
```

**Data Storage:**
```javascript
// Key by week (ISO week string)
const weekStr = format(today, 'yyyy-\'W\'II') // e.g., "2026-W14"

reflections[weekStr] = {
  ...reflections[weekStr],
  sabbath: {
    practices: ['no_screens', 'nature', 'family'],
    note: "Spent the afternoon at the beach with the kids",
    rating: 4,
    completed: true,
  }
}
```

**Settings Addition:**
Add to Settings page under a "Rhythms" section:
```
Sabbath Day: [Sun] Mon Tue Wed Thu Fri Sat
```
Default: Sunday. Store in `settings.sabbathDay` (0-6, 0 = Sunday).

---

## Files Summary

| File | Change |
|---|---|
| `src/components/DailyExamen.jsx` | NEW — 5-step evening review |
| `src/components/ScriptureMemory.jsx` | NEW — weekly verse flashcard |
| `src/components/SilenceTimer.jsx` | NEW — guided silence practice |
| `src/components/GratitudeJournal.jsx` | NEW — 3 daily gratitudes |
| `src/components/SabbathCheckin.jsx` | NEW — weekly rest check-in |
| `src/components/Dashboard.jsx` | Add cards for all 5 practices |
| `src/components/Settings.jsx` | Add Sabbath day selector |

---

## Dashboard Layout (updated, top to bottom)

1. Header (greeting)
2. **Daily Scripture** (hero)
3. **Today's Devotional Preview**
4. **Daily Psalm**
5. **Scripture Memory** (this week's verse) ← NEW
6. **Gratitude Journal** (3 things) ← NEW
7. Five Capitals Progress
8. Three Pillars
9. **Evening Examen** (after 5pm, or "Review last night's") ← NEW
10. **Sabbath Check-in** (on Sabbath day) or countdown ← NEW
11. Quick Actions
12. Active Streaks
13. Alignment Score
14. Insights

**Note:** The Silence Timer is NOT on the Dashboard — it's accessed from the Meditation discipline enrichment or from a "Practices" section in Settings/Quick Actions.

---

## Do NOT Change
- DisciplineTracker — already complete
- DisciplineEnrichments — already complete
- BibleReader — already complete
- DevotionalGuide — already complete
- ThreePillars — just fixed

## After Building
- Run `npm run build` to verify no compile errors
- Run `npx playwright test` to verify existing tests still pass
- Add new tests for each practice
- Do NOT commit — Noah wants to preview first
