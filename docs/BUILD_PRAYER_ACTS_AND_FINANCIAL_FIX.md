# Build Instructions: Prayer ACTS Framework + Financial Capital Fix

**Author:** Opus (architect)
**Executor:** Sonnet (builder)
**Date:** April 2, 2026
**Priority:** Ship both in one commit

---

## Overview

Two changes:
1. **Prayer ACTS Framework** — Replace the "Prayer" checkbox with a guided prayer experience
2. **Financial Capital Simplification** — Replace 4 daily checkboxes with a single stewardship reflection

Both changes happen in the DisciplineTracker flow on `/today`.

---

## Change 1: Prayer ACTS Framework

### What it is
When a user taps "Prayer" in the Spiritual capital section, instead of just toggling a checkbox, they get a guided ACTS prayer flow:
- **A**doration — "Praise God for who he is"
- **C**onfession — "Bring your failures into the light"
- **T**hanksgiving — "Thank God for what he's done"
- **S**upplication — "Ask God for what you need"

Each step has a text input. When they complete at least one step, the Prayer discipline is marked as done.

### Files to modify

**`src/components/DisciplineTracker.jsx`**

1. Create a new component `PrayerACTS` inside the file (or as a separate file `src/components/PrayerACTS.jsx`):

```
const ACTS_STEPS = [
  {
    id: 'adoration',
    letter: 'A',
    title: 'Adoration',
    prompt: 'Praise God for who he is. His character, his nature, his faithfulness.',
    placeholder: 'God, I praise you for...',
    color: '#D4A843',
  },
  {
    id: 'confession',
    letter: 'C',
    title: 'Confession',
    prompt: 'Bring your failures and struggles into the light. He already knows — and his response is mercy.',
    placeholder: 'Lord, I confess...',
    color: '#E07B6A',
  },
  {
    id: 'thanksgiving',
    letter: 'T',
    title: 'Thanksgiving',
    prompt: 'Thank God for what he has done. Specific blessings, answered prayers, daily gifts.',
    placeholder: 'Thank you for...',
    color: '#5BB98B',
  },
  {
    id: 'supplication',
    letter: 'S',
    title: 'Supplication',
    prompt: 'Ask God for what you need. For yourself, your family, your community, the world.',
    placeholder: 'I ask you for...',
    color: '#6B8DE3',
  },
]
```

2. The component should:
   - Render as an expandable section that appears when the user taps "Prayer" (instead of just toggling a checkbox)
   - Show 4 steps vertically, each with:
     - A colored circle with the letter (A, C, T, S)
     - The title and prompt text
     - A textarea input (2-3 rows)
   - Store prayer entries in `reflections[dateStr].prayer_acts` (object with keys: adoration, confession, thanksgiving, supplication)
   - When ANY step has text, auto-mark the "prayer" discipline as complete in `disciplines[dateStr].prayer`
   - Include a "Close" or collapse button to return to the checklist view

3. In `DisciplineCheckItem`, add special handling: when `discipline.id === 'prayer'`, tapping it should expand the ACTS flow instead of just toggling the checkbox. Use a state variable like `showPrayerFlow` in the parent `DisciplineTracker` component.

4. Data storage pattern (uses existing `reflections` state):
```javascript
// reflections[dateStr].prayer_acts = {
//   adoration: "God, I praise you for your faithfulness...",
//   confession: "I confess I was impatient today...",
//   thanksgiving: "Thank you for my family...",
//   supplication: "Please give me wisdom for..."
// }
```

5. When the ACTS section has at least one field filled, call:
```javascript
setDisciplines(prev => ({
  ...prev,
  [dateStr]: { ...(prev[dateStr] || {}), prayer: true }
}))
```

6. Visual style: Match the existing card style in DisciplineTracker. Use `rounded-2xl`, `var(--bg-card)`, `var(--border)`. Each ACTS step should feel like a mini-card within the section. Use the colors defined above for each letter circle.

### Props needed
The `DisciplineTracker` component already receives `reflections` and `setReflections` — use those for storing ACTS data. It also has `disciplines` and `setDisciplines` — use those to auto-check prayer.

---

## Change 2: Financial Capital Simplification

### What it is
Replace the 4 Financial discipline checkboxes (Giving/Tithing, Budgeting, Generosity, Saving) with a single stewardship reflection card.

### Files to modify

**`src/utils/capitals.js`**

1. Change the `financial` capital's `disciplines` array from 4 items to 1:

```javascript
financial: {
  // ... keep all existing fields (name, color, description, etc.)
  disciplines: [
    { id: 'stewardship', label: 'Financial Stewardship' },
  ],
}
```

### `src/components/DisciplineTracker.jsx`

2. Add special rendering for the Financial capital section. Instead of showing a checklist for financial, show a stewardship reflection card:

When `capitalId === 'financial'`, render a custom section instead of `DisciplineCheckItem` components:

```
- Header: "How did you steward your resources today?"
- 4 quick-tap options (not checkboxes — tap to highlight, multiple select):
  - "Gave generously" (icon: heart)
  - "Spent wisely" (icon: check)
  - "Saved intentionally" (icon: piggy bank / arrow up)
  - "Reviewed finances" (icon: chart)
- A small text input: "Notes (optional)" — for brief reflection
- When ANY option is tapped, mark `stewardship` discipline as complete
```

3. Store the selected options in `disciplines[dateStr]` as:
```javascript
// disciplines[dateStr].stewardship = true  (for completion tracking)
// reflections[dateStr].financial_stewardship = {
//   gave: true,
//   spent_wisely: false,
//   saved: true,
//   reviewed: false,
//   notes: "Tithed this week"
// }
```

4. Visual style: Use the financial capital color (`#B07EE0`). The quick-tap options should be pill-shaped buttons that highlight when selected. Match the existing card style.

### Important
- This changes the total discipline count, which affects completion percentage
- Old data with `giving-tithing`, `budgeting`, `generosity`, `saving` keys will still exist in localStorage — that's fine, it won't break anything, it just won't be counted anymore
- The `getDisciplinesForCapital('financial')` will now return only 1 discipline, so the `0/1` count and completion math will automatically adjust

---

## Testing

After building, verify:
1. Open `/today` — Spiritual section should show Prayer with ACTS expand behavior
2. Tap Prayer — ACTS flow expands with 4 prompts
3. Type in Adoration field — Prayer checkbox auto-completes
4. Close/collapse ACTS — prayer shows as checked
5. Financial section shows the new stewardship card instead of 4 checkboxes
6. Tap "Gave generously" — stewardship marks as complete
7. Overall completion percentage should now be achievable (fewer total disciplines)
8. Reload page — all data persists
9. Check that the Dashboard "Up Next" section reflects the new discipline list
10. Run `npx playwright test` — fix any broken tests (the discipline count tests will need updating)

---

## Files summary

| File | Change |
|---|---|
| `src/utils/capitals.js` | Financial disciplines: 4 → 1 |
| `src/components/DisciplineTracker.jsx` | Add PrayerACTS component + Financial stewardship card |
| `tests/app.spec.js` | Update discipline count tests (was 0/5, now different) |

---

## Do NOT change
- The Word/Devotional tab — already done
- The Three Pillars component — already done
- Navigation — already done
- Any backend files
- The Dashboard layout

## After building
- Run `npm run build` to verify no compile errors
- Run `npx playwright test` to verify all tests pass
- Do NOT commit — Noah wants to preview first on localhost:5175
