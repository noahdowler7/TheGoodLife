// Bible data loading utilities
// Lazy-loads book data from public/bible/ directory and caches in memory

let bibleIndex = null
const bookCache = {}

export async function getBibleIndex() {
  if (bibleIndex) return bibleIndex
  const res = await fetch('/bible/index.json')
  bibleIndex = await res.json()
  return bibleIndex
}

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
    abbreviation: book.abbreviation,
    chapter: parseInt(chapter),
    verses: book.chapters[String(chapter)] || [],
  }
}

// Save and retrieve last read position
const POSITION_KEY = 'thegoodlife_bible_position'

export function getLastPosition() {
  try {
    const raw = localStorage.getItem(POSITION_KEY)
    return raw ? JSON.parse(raw) : { bookId: 'jhn', chapter: 1 }
  } catch {
    return { bookId: 'jhn', chapter: 1 }
  }
}

export function savePosition(bookId, chapter) {
  localStorage.setItem(POSITION_KEY, JSON.stringify({ bookId, chapter }))
}

// Parse a scripture reference string like "John 3:16" or "1 Corinthians 13:4-7" or "Psalm 23"
// into { bookId, chapter }
const BOOK_NAME_MAP = {
  'genesis': 'gen', 'exodus': 'exo', 'leviticus': 'lev', 'numbers': 'num',
  'deuteronomy': 'deu', 'joshua': 'jos', 'judges': 'jdg', 'ruth': 'rut',
  '1 samuel': '1sa', '2 samuel': '2sa', '1 kings': '1ki', '2 kings': '2ki',
  '1 chronicles': '1ch', '2 chronicles': '2ch', 'ezra': 'ezr', 'nehemiah': 'neh',
  'esther': 'est', 'job': 'job', 'psalm': 'psa', 'psalms': 'psa',
  'proverbs': 'pro', 'ecclesiastes': 'ecc', 'song of solomon': 'sng',
  'isaiah': 'isa', 'jeremiah': 'jer', 'lamentations': 'lam', 'ezekiel': 'ezk',
  'daniel': 'dan', 'hosea': 'hos', 'joel': 'jol', 'amos': 'amo',
  'obadiah': 'oba', 'jonah': 'jon', 'micah': 'mic', 'nahum': 'nah',
  'habakkuk': 'hab', 'zephaniah': 'zep', 'haggai': 'hag', 'zechariah': 'zec',
  'malachi': 'mal', 'matthew': 'mat', 'mark': 'mrk', 'luke': 'luk',
  'john': 'jhn', 'acts': 'act', 'romans': 'rom', '1 corinthians': '1co',
  '2 corinthians': '2co', 'galatians': 'gal', 'ephesians': 'eph',
  'philippians': 'php', 'colossians': 'col', '1 thessalonians': '1th',
  '2 thessalonians': '2th', '1 timothy': '1ti', '2 timothy': '2ti',
  'titus': 'tit', 'philemon': 'phm', 'hebrews': 'heb', 'james': 'jas',
  '1 peter': '1pe', '2 peter': '2pe', '1 john': '1jn', '2 john': '2jn',
  '3 john': '3jn', 'jude': 'jud', 'revelation': 'rev',
}

export function parseScriptureRef(ref) {
  if (!ref) return null
  // Match patterns like "John 3:16", "1 Corinthians 13:4-7", "Psalm 23", "Romans 8:28"
  const match = ref.match(/^(\d?\s?[A-Za-z\s]+?)\s+(\d+)(?::(\d+))?/i)
  if (!match) return null
  const bookName = match[1].trim().toLowerCase()
  const chapter = parseInt(match[2])
  const bookId = BOOK_NAME_MAP[bookName]
  if (!bookId) return null
  return { bookId, chapter }
}
