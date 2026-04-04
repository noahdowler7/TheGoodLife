// Liturgical Calendar Engine for The Good Life
// Calculates Easter, derives moveable feasts, and identifies liturgical days/seasons
// Pure math — no external dependencies

// Season colors (traditional liturgical palette)
const COLORS = {
  advent: '#6B7FBF',     // blue-violet — expectation, hope
  christmas: '#D4A843',  // gold — joy, celebration
  holyWeek: '#7B4E8B',   // purple — the cross, sacrifice
  easter: '#D4A843',     // gold — resurrection, victory
  pentecost: '#C94040',  // red — Holy Spirit, fire
}

/**
 * Compute Easter Sunday for a given year using the
 * Anonymous Gregorian algorithm (Meeus/Jones/Butcher variant).
 * Returns a Date object in local time.
 */
export function getEasterDate(year) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

/**
 * Add days to a date (returns new Date).
 */
function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Check if two dates are the same calendar day.
 */
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

/**
 * Check if date is within [start, end] inclusive.
 */
function inRange(date, start, end) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  return d >= s && d <= e
}

/**
 * Calculate the first Sunday of Advent for a given year.
 * Advent begins on the Sunday nearest to November 30 — specifically,
 * the Sunday that falls between Nov 27 and Dec 3 inclusive.
 */
function getAdventStart(year) {
  // Christmas is Dec 25. Advent 4 is the Sunday on or before Dec 25.
  // Advent 1 is 3 weeks before Advent 4.
  const christmas = new Date(year, 11, 25) // Dec 25
  const christmasDow = christmas.getDay() // 0=Sun
  // Days back to the most recent Sunday (Advent 4)
  const daysBack = christmasDow === 0 ? 0 : christmasDow
  const advent4 = addDays(christmas, -daysBack)
  const advent1 = addDays(advent4, -21)
  return advent1
}

/**
 * Get all Advent Sundays for a year.
 */
function getAdventSundays(year) {
  const advent1 = getAdventStart(year)
  return [
    advent1,
    addDays(advent1, 7),
    addDays(advent1, 14),
    addDays(advent1, 21),
  ]
}

/**
 * Get the liturgical day for a specific date.
 * Returns { key, name, season, color } or null for ordinary time.
 *
 * Priority: specific named days > season generics
 */
export function getLiturgicalDay(date) {
  const year = date.getFullYear()
  const month = date.getMonth() // 0-indexed
  const day = date.getDate()
  const easter = getEasterDate(year)

  // --- Fixed dates (highest priority for their specific days) ---

  // Christmas Day — Dec 25
  if (month === 11 && day === 25) {
    return { key: 'christmas-day', name: 'Christmas Day', season: 'christmas', color: COLORS.christmas }
  }
  // Christmas Eve — Dec 24
  if (month === 11 && day === 24) {
    return { key: 'christmas-eve', name: 'Christmas Eve', season: 'christmas', color: COLORS.christmas }
  }
  // Epiphany — Jan 6
  if (month === 0 && day === 6) {
    return { key: 'epiphany', name: 'Epiphany', season: 'christmas', color: COLORS.christmas }
  }

  // --- Moveable feasts derived from Easter ---

  // Easter Sunday
  if (sameDay(date, easter)) {
    return { key: 'easter-sunday', name: 'Easter Sunday', season: 'easter', color: COLORS.easter }
  }
  // Good Friday
  if (sameDay(date, addDays(easter, -2))) {
    return { key: 'good-friday', name: 'Good Friday', season: 'holy-week', color: COLORS.holyWeek }
  }
  // Holy Saturday
  if (sameDay(date, addDays(easter, -1))) {
    return { key: 'holy-saturday', name: 'Holy Saturday', season: 'holy-week', color: COLORS.holyWeek }
  }
  // Maundy Thursday
  if (sameDay(date, addDays(easter, -3))) {
    return { key: 'maundy-thursday', name: 'Maundy Thursday', season: 'holy-week', color: COLORS.holyWeek }
  }
  // Palm Sunday
  if (sameDay(date, addDays(easter, -7))) {
    return { key: 'palm-sunday', name: 'Palm Sunday', season: 'holy-week', color: COLORS.holyWeek }
  }
  // Ascension Day
  if (sameDay(date, addDays(easter, 39))) {
    return { key: 'ascension-day', name: 'Ascension Day', season: 'easter', color: COLORS.easter }
  }
  // Pentecost
  if (sameDay(date, addDays(easter, 49))) {
    return { key: 'pentecost', name: 'Pentecost', season: 'pentecost', color: COLORS.pentecost }
  }

  // --- Advent Sundays ---
  const adventSundays = getAdventSundays(year)
  for (let i = 0; i < 4; i++) {
    if (sameDay(date, adventSundays[i])) {
      return { key: `advent-sunday-${i + 1}`, name: `Advent Sunday ${i + 1}`, season: 'advent', color: COLORS.advent }
    }
  }

  // --- Season generics (for days within a season but not a named day) ---

  // Holy Week (Mon-Wed between Palm Sunday and Maundy Thursday)
  const palmSunday = addDays(easter, -7)
  const maundyThursday = addDays(easter, -3)
  if (inRange(date, addDays(palmSunday, 1), addDays(maundyThursday, -1))) {
    return { key: 'holy-week', name: 'Holy Week', season: 'holy-week', color: COLORS.holyWeek }
  }

  // Easter season (Easter Sunday through day before Pentecost)
  const pentecost = addDays(easter, 49)
  if (inRange(date, easter, addDays(pentecost, -1))) {
    return { key: 'easter-generic', name: 'Easter Season', season: 'easter', color: COLORS.easter }
  }

  // Advent (Advent Sunday 1 through Dec 23)
  const adventStart = getAdventStart(year)
  if (inRange(date, adventStart, new Date(year, 11, 23))) {
    return { key: 'advent-generic', name: 'Advent', season: 'advent', color: COLORS.advent }
  }

  // Christmas season (Dec 25 through Jan 5)
  // Handle Dec 25-31 of current year
  if (month === 11 && day >= 25) {
    return { key: 'christmas-generic', name: 'Christmas Season', season: 'christmas', color: COLORS.christmas }
  }
  // Handle Jan 1-5 (Christmas season from prior year)
  if (month === 0 && day >= 1 && day <= 5) {
    return { key: 'christmas-generic', name: 'Christmas Season', season: 'christmas', color: COLORS.christmas }
  }

  // Ordinary time
  return null
}

/**
 * Get the broader liturgical season for any date.
 * Always returns a value (never null) — "ordinary" for non-special days.
 */
export function getLiturgicalSeason(date) {
  const day = getLiturgicalDay(date)
  if (day) {
    return { key: day.season, name: getSeasonName(day.season), color: day.color }
  }
  return { key: 'ordinary', name: 'Ordinary Time', color: null }
}

function getSeasonName(seasonKey) {
  const names = {
    advent: 'Advent',
    christmas: 'Christmas',
    'holy-week': 'Holy Week',
    easter: 'Easter',
    pentecost: 'Pentecost',
    ordinary: 'Ordinary Time',
  }
  return names[seasonKey] || 'Ordinary Time'
}
