# Build Instructions: Dashboard Redesign + Full Bible Integration

**Author:** Opus (architect)
**Executor:** Sonnet (builder)
**Date:** April 2, 2026
**Priority:** Ship together — the Bible integration makes the dashboard redesign meaningful

---

## Overview

Two major changes:
1. **Dashboard Redesign** — Lead with God's Word, not a to-do list. Remove "Up Next" section, promote scripture and devotional content to hero position.
2. **Full Bible Integration** — Bundle the entire World English Bible (public domain) into the app. Add a Bible reader to the Word tab. Connect daily readings throughout the app.

---

## Change 1: Dashboard Redesign

### The Problem
The current dashboard opens with a wall of 0% progress rings and unchecked "Up Next" disciplines. It feels like opening a productivity app that reminds you of everything you haven't done. The inspiring content (scripture, Three Pillars) is buried below the fold.

### The Principle
**Lead with God's Word, not your to-do list.** The first thing a user sees should draw them closer to God, not make them feel behind.

### New Layout (top to bottom)

#### 1. Header (keep as-is)
- Date, greeting, profile button
- No changes needed

#### 2. Daily Scripture Card (MOVE from bottom to #2 position)
- This is already built — just move it up
- Make it slightly larger/more prominent
- Currently at the very bottom of Dashboard.jsx — move it to right after the header
- Keep the existing `getDailyScripture()` function and styling

#### 3. Today's Devotional Preview (NEW)
- Small card showing a preview of today's devotional content
- Pull from the existing `DevotionalGuide` data (the daily reading)
- Show: Book name + chapter reference, first 1-2 sentences of the passage
- "Continue Reading" button → navigates to `/devotional`
- Style: Use spiritual capital color (#D4A843), subtle card with book icon

```jsx
// Example structure:
<div className="home-card">
  <div className="flex items-center gap-3 mb-2">
    <BookIcon color="#D4A843" />
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted">Today's Reading</p>
      <p className="text-[15px] font-semibold text-primary">John 15:1-17</p>
    </div>
  </div>
  <p className="text-[14px] text-secondary italic leading-relaxed">
    "I am the true vine, and my Father is the gardener..."
  </p>
  <button onClick={() => navigate('/devotional')} className="mt-3 text-[13px] font-medium" style={{ color: '#D4A843' }}>
    Continue Reading →
  </button>
</div>
```

To get the daily reading data: import the devotional/reading data from wherever `DevotionalGuide` gets its content. If it uses a scripture list, import that same list and show today's entry.

#### 4. Three Pillars (keep as-is, same position)
- "The Way of Jesus" expandable card
- Already works well, no changes

#### 5. Five Capitals Progress (keep, but simplify)
- Keep the progress rings row
- REMOVE the "0% today" text when completion is 0 — only show percentage when > 0
- Change the label from "0% today" to just show the percentage when there's progress

```jsx
// Instead of always showing "X% today", only show when > 0:
{overallCompletion > 0 && (
  <span className="text-[13px] font-medium" style={{ color: 'var(--accent)' }}>
    {Math.round(overallCompletion * 100)}% today
  </span>
)}
```

#### 6. Quick Actions Grid (keep as-is)
- Today, Weekly, Calendar, Fasting — 2x2 grid
- No changes

#### 7. Active Streaks (keep as-is)
- Only shows when streaks exist

#### 8. Alignment Widget + Insights (keep at bottom)
- No changes

### What to REMOVE
- **"Up Next" section** — DELETE entirely. Every discipline now has an enrichment, so tapping them just navigates to /today anyway. It's redundant with the Today tab and makes Home feel like a task list.
- Remove `handleToggleDiscipline` from Dashboard (no longer used)
- Remove `uncompletedDisciplines` computation (no longer used)

### Files to modify

**`src/components/Dashboard.jsx`**

1. Remove the "Up Next" section (the entire `<motion.section>` block with `uncompletedDisciplines`)
2. Remove `handleToggleDiscipline` function
3. Remove `uncompletedDisciplines` useMemo
4. Move the Daily Scripture card from bottom to position #2 (right after the header)
5. Add a new "Today's Devotional Preview" card at position #3
6. Modify the Five Capitals "0% today" to only show when > 0
7. Clean up unused imports (ENRICHED_DISCIPLINES was already removed)

---

## Change 2: Full Bible Integration

### What it is
Bundle the entire World English Bible (WEB) into the app as JSON files. Add a full Bible reader to the Word tab alongside the existing devotional content.

### Why WEB?
- **Public domain** — no licensing, no API keys, no cost
- **Modern English** — readable, not archaic like KJV
- **Offline** — bundled in the app, works without internet
- **~4.5MB** total — service worker caches it, loads fast after first visit

### Step 1: Get the Bible Data

Download the World English Bible in JSON format. Create the data structure:

```
public/bible/
  index.json          — metadata for all 66 books
  gen.json            — Genesis
  exo.json            — Exodus
  lev.json            — Leviticus
  ... (one file per book)
  rev.json            — Revelation
```

**`public/bible/index.json`** format:
```json
[
  { "id": "gen", "name": "Genesis", "testament": "OT", "chapters": 50 },
  { "id": "exo", "name": "Exodus", "testament": "OT", "chapters": 40 },
  { "id": "lev", "name": "Leviticus", "testament": "OT", "chapters": 27 },
  ...
  { "id": "rev", "name": "Revelation", "testament": "NT", "chapters": 22 }
]
```

**Each book file** (e.g., `public/bible/gen.json`) format:
```json
{
  "book": "Genesis",
  "abbreviation": "gen",
  "chapters": {
    "1": [
      { "verse": 1, "text": "In the beginning, God created the heavens and the earth." },
      { "verse": 2, "text": "The earth was formless and empty. Darkness was on the surface of the deep and God's Spirit was hovering over the surface of the waters." }
    ],
    "2": [ ... ]
  }
}
```

**How to generate the data:**

Option A (recommended): Use a script to fetch from a public Bible API and save as JSON files.

Create `scripts/fetch-bible.js`:
```javascript
// Fetch WEB Bible from a public API and save as JSON files
// Use https://bible-api.com/ (free, no key needed, WEB translation)
// OR download from https://ebible.org/web/ (full WEB download)
// OR use the CDN: https://cdn.jsdelivr.net/gh/nicoleahmed/BibleJSON@master/
```

Option B: Manually create the JSON files from a public domain source. The World English Bible text is freely available at https://ebible.org/web/ in multiple formats.

Option C: Use a Node script that fetches each book from bible-api.com:
```javascript
// For each book, fetch all chapters:
// https://bible-api.com/genesis+1?translation=web
// Parse and save to public/bible/gen.json
```

**IMPORTANT:** The Bible data goes in `public/bible/` (not `src/`), so it's served as static files and lazy-loaded on demand. This keeps the main JS bundle small.

### Step 2: Create Bible Utility Functions

**Create `src/utils/bible.js`**

```javascript
// Bible book metadata (loaded from index.json)
let bibleIndex = null

export async function getBibleIndex() {
  if (bibleIndex) return bibleIndex
  const res = await fetch('/bible/index.json')
  bibleIndex = await res.json()
  return bibleIndex
}

// Cache for loaded books
const bookCache = {}

export async function getBook(bookId) {
  if (bookCache[bookId]) return bookCache[bookId]
  const res = await fetch(`/bible/${bookId}.json`)
  const data = await res.json()
  bookCache[bookId] = data
  return data
}

export async function getChapter(bookId, chapter) {
  const book = await getBook(bookId)
  return {
    book: book.book,
    chapter: parseInt(chapter),
    verses: book.chapters[chapter] || [],
  }
}

// Get a specific verse range (e.g., "John 3:16-17")
export async function getVerseRange(bookId, chapter, startVerse, endVerse) {
  const chapterData = await getChapter(bookId, chapter)
  return chapterData.verses.filter(v => v.verse >= startVerse && v.verse <= endVerse)
}

// Search the Bible (searches loaded books only for performance)
export function searchInBook(bookData, query) {
  const results = []
  const queryLower = query.toLowerCase()
  for (const [chapter, verses] of Object.entries(bookData.chapters)) {
    for (const verse of verses) {
      if (verse.text.toLowerCase().includes(queryLower)) {
        results.push({ book: bookData.book, chapter: parseInt(chapter), ...verse })
      }
    }
  }
  return results
}
```

### Step 3: Create the Bible Reader Component

**Create `src/components/BibleReader.jsx`**

This is a full Bible reading experience:

1. **Book selector** — Scrollable list of all 66 books, grouped by Old/New Testament
2. **Chapter selector** — Grid of chapter numbers for the selected book
3. **Chapter view** — Beautiful verse-by-verse display with:
   - Book + chapter header
   - Verse numbers in superscript
   - Comfortable reading typography (16px, 1.8 line-height)
   - Tap a verse to highlight it
   - "Copy verse" action on highlighted verse
4. **Navigation** — Previous/Next chapter buttons at bottom
5. **Last read** — Remember where the user left off (save to localStorage)

```
Layout:
┌────────────────────────────┐
│ ← Genesis 1                │  ← Back button + book/chapter title
│────────────────────────────│
│                            │
│ ¹In the beginning, God     │  ← Verses with superscript numbers
│ created the heavens and    │
│ the earth. ²The earth was  │
│ formless and empty...      │
│                            │
│ ³God said, "Let there be   │
│ light," and there was      │
│ light.                     │
│                            │
│        [< Prev] [Next >]   │  ← Chapter navigation
└────────────────────────────┘
```

**Key props/state:**
- `selectedBook` — current book ID (default: 'gen' or last read)
- `selectedChapter` — current chapter number (default: 1 or last read)
- `view` — 'books' | 'chapters' | 'reading' (navigation states)
- Save last read position to `localStorage` key `thegoodlife_bible_position`

**Styling:**
- Match existing app style (var(--bg-card), var(--text-primary), etc.)
- Reading view should feel calm — generous padding, larger text
- Verse numbers: small, superscript, muted color
- Use `font-family: 'Georgia', serif` or similar for reading (not Bebas Neue)

### Step 4: Integrate Bible Reader into Word Tab

**Modify `src/components/DevotionalGuide.jsx`**

Add a tab/toggle at the top of the Word page:
- **"Devotional"** — existing devotional content (default)
- **"Bible"** — new Bible reader

```jsx
const [activeTab, setActiveTab] = useState('devotional') // 'devotional' | 'bible'

// Tab bar at top:
<div className="flex gap-2 mb-4">
  <button
    onClick={() => setActiveTab('devotional')}
    className={`flex-1 py-2 rounded-xl text-[14px] font-medium ${activeTab === 'devotional' ? 'active' : ''}`}
    style={{
      background: activeTab === 'devotional' ? 'var(--accent-light)' : 'var(--bg-tertiary)',
      color: activeTab === 'devotional' ? 'var(--accent)' : 'var(--text-secondary)',
    }}
  >
    Devotional
  </button>
  <button
    onClick={() => setActiveTab('bible')}
    className={`flex-1 py-2 rounded-xl text-[14px] font-medium`}
    style={{
      background: activeTab === 'bible' ? 'var(--accent-light)' : 'var(--bg-tertiary)',
      color: activeTab === 'bible' ? 'var(--accent)' : 'var(--text-secondary)',
    }}
  >
    Bible
  </button>
</div>

{activeTab === 'devotional' ? (
  // ... existing devotional content
) : (
  <BibleReader />
)}
```

### Step 5: Connect Bible to Dashboard Devotional Preview

In the new Dashboard devotional preview card, show today's reading from the devotional guide. Import the same scripture data that DevotionalGuide uses and display a preview.

If DevotionalGuide has a scripture reference for today (e.g., "John 15:1-17"), show:
- The reference
- First 1-2 verses of the passage (fetched from the Bible data)
- "Continue Reading →" button

---

## Testing

After building, verify:
1. Dashboard loads with scripture card at top — no "Up Next" section
2. Devotional preview card shows today's reading with real Bible text
3. Five Capitals shows progress rings — no "0% today" when at zero
4. Word tab has Devotional/Bible toggle
5. Bible reader loads book list (66 books, OT/NT sections)
6. Can navigate to any book → chapter → read verses
7. Chapter navigation (prev/next) works at edges (Gen 1 has no prev, Rev 22 has no next)
8. Bible text is readable and properly formatted
9. Last read position persists across page reloads
10. Verse tap highlights and shows copy action
11. Bible works offline (after first load, disconnect internet, reload)
12. Three Pillars still works on dashboard
13. Quick Access grid still navigates correctly
14. Run `npm run build` — verify no errors, check bundle size impact
15. Run `npx playwright test` — update any broken tests

---

## Files Summary

| File | Change |
|---|---|
| `src/components/Dashboard.jsx` | Remove Up Next, move scripture up, add devotional preview, hide 0% |
| `src/components/DevotionalGuide.jsx` | Add Devotional/Bible tab toggle |
| `src/components/BibleReader.jsx` | NEW — full Bible reading component |
| `src/utils/bible.js` | NEW — Bible data fetching + caching utilities |
| `public/bible/index.json` | NEW — Bible book metadata |
| `public/bible/*.json` | NEW — 66 book files (one per book) |
| `scripts/fetch-bible.js` | NEW — Script to download and format WEB Bible data |
| `tests/app.spec.js` | Update dashboard tests (no more Up Next), add Bible reader tests |

---

## Do NOT Change
- DisciplineTracker — already done
- DisciplineEnrichments — already done
- Prayer ACTS / Financial Stewardship — already done
- Navigation tabs — already done
- Settings — no changes needed
- Three Pillars — no changes needed

## After Building
- Run `npm run build` to verify no compile errors
- Run `npx playwright test` to verify tests pass
- Do NOT commit — Noah wants to preview first

---

## Bible Data: Full Book List

For reference, here are all 66 books with their abbreviation IDs:

**Old Testament (39 books):**
gen, exo, lev, num, deu, jos, jdg, rut, 1sa, 2sa, 1ki, 2ki, 1ch, 2ch, ezr, neh, est, job, psa, pro, ecc, sng, isa, jer, lam, ezk, dan, hos, jol, amo, oba, jon, mic, nah, hab, zep, hag, zec, mal

**New Testament (27 books):**
mat, mrk, luk, jhn, act, rom, 1co, 2co, gal, eph, php, col, 1th, 2th, 1ti, 2ti, tit, phm, heb, jas, 1pe, 2pe, 1jn, 2jn, 3jn, jud, rev
