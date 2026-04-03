import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getChapter, savePosition } from '../utils/bible'

const MEMORY_VERSES = [
  { ref: 'John 15:5', book: 'jhn', chapter: 15, start: 5, end: 5 },
  { ref: 'Psalm 23:1-3', book: 'psa', chapter: 23, start: 1, end: 3 },
  { ref: 'Proverbs 3:5-6', book: 'pro', chapter: 3, start: 5, end: 6 },
  { ref: 'Philippians 4:6-7', book: 'php', chapter: 4, start: 6, end: 7 },
  { ref: 'Romans 8:28', book: 'rom', chapter: 8, start: 28, end: 28 },
  { ref: 'Isaiah 41:10', book: 'isa', chapter: 41, start: 10, end: 10 },
  { ref: 'Matthew 6:33', book: 'mat', chapter: 6, start: 33, end: 33 },
  { ref: 'Jeremiah 29:11', book: 'jer', chapter: 29, start: 11, end: 11 },
  { ref: 'Galatians 5:22-23', book: 'gal', chapter: 5, start: 22, end: 23 },
  { ref: 'Joshua 1:9', book: 'jos', chapter: 1, start: 9, end: 9 },
  { ref: 'Psalm 46:10', book: 'psa', chapter: 46, start: 10, end: 10 },
  { ref: 'Romans 12:2', book: 'rom', chapter: 12, start: 2, end: 2 },
  { ref: '2 Timothy 1:7', book: '2ti', chapter: 1, start: 7, end: 7 },
  { ref: 'Hebrews 11:1', book: 'heb', chapter: 11, start: 1, end: 1 },
  { ref: 'Psalm 119:105', book: 'psa', chapter: 119, start: 105, end: 105 },
  { ref: 'Ephesians 2:8-9', book: 'eph', chapter: 2, start: 8, end: 9 },
  { ref: 'James 1:5', book: 'jas', chapter: 1, start: 5, end: 5 },
  { ref: 'Micah 6:8', book: 'mic', chapter: 6, start: 8, end: 8 },
  { ref: 'Psalm 139:14', book: 'psa', chapter: 139, start: 14, end: 14 },
  { ref: '1 John 4:19', book: '1jn', chapter: 4, start: 19, end: 19 },
  { ref: 'Romans 5:8', book: 'rom', chapter: 5, start: 8, end: 8 },
  { ref: 'Colossians 3:23', book: 'col', chapter: 3, start: 23, end: 23 },
  { ref: 'Lamentations 3:22-23', book: 'lam', chapter: 3, start: 22, end: 23 },
  { ref: 'Matthew 11:28-30', book: 'mat', chapter: 11, start: 28, end: 30 },
  { ref: 'Psalm 27:1', book: 'psa', chapter: 27, start: 1, end: 1 },
  { ref: '2 Corinthians 5:17', book: '2co', chapter: 5, start: 17, end: 17 },
  { ref: 'Deuteronomy 31:6', book: 'deu', chapter: 31, start: 6, end: 6 },
  { ref: 'Psalm 34:18', book: 'psa', chapter: 34, start: 18, end: 18 },
  { ref: 'Isaiah 40:31', book: 'isa', chapter: 40, start: 31, end: 31 },
  { ref: 'John 3:16', book: 'jhn', chapter: 3, start: 16, end: 16 },
  { ref: 'Romans 8:38-39', book: 'rom', chapter: 8, start: 38, end: 39 },
  { ref: 'Psalm 51:10', book: 'psa', chapter: 51, start: 10, end: 10 },
  { ref: '1 Thessalonians 5:16-18', book: '1th', chapter: 5, start: 16, end: 18 },
  { ref: 'John 14:27', book: 'jhn', chapter: 14, start: 27, end: 27 },
  { ref: 'Psalm 118:24', book: 'psa', chapter: 118, start: 24, end: 24 },
  { ref: 'Matthew 28:19-20', book: 'mat', chapter: 28, start: 19, end: 20 },
  { ref: 'Philippians 1:6', book: 'php', chapter: 1, start: 6, end: 6 },
  { ref: 'Psalm 37:4', book: 'psa', chapter: 37, start: 4, end: 4 },
  { ref: 'John 14:6', book: 'jhn', chapter: 14, start: 6, end: 6 },
  { ref: 'Hebrews 12:1-2', book: 'heb', chapter: 12, start: 1, end: 2 },
  { ref: 'Psalm 91:1-2', book: 'psa', chapter: 91, start: 1, end: 2 },
  { ref: 'Proverbs 18:10', book: 'pro', chapter: 18, start: 10, end: 10 },
  { ref: 'Romans 15:13', book: 'rom', chapter: 15, start: 13, end: 13 },
  { ref: 'Isaiah 26:3', book: 'isa', chapter: 26, start: 3, end: 3 },
  { ref: 'Matthew 5:14-16', book: 'mat', chapter: 5, start: 14, end: 16 },
  { ref: 'Psalm 16:11', book: 'psa', chapter: 16, start: 11, end: 11 },
  { ref: 'John 10:10', book: 'jhn', chapter: 10, start: 10, end: 10 },
  { ref: 'Ephesians 3:20', book: 'eph', chapter: 3, start: 20, end: 20 },
  { ref: '1 Peter 5:7', book: '1pe', chapter: 5, start: 7, end: 7 },
  { ref: 'Psalm 121:1-2', book: 'psa', chapter: 121, start: 1, end: 2 },
  { ref: 'Zephaniah 3:17', book: 'zep', chapter: 3, start: 17, end: 17 },
  { ref: 'Numbers 6:24-26', book: 'num', chapter: 6, start: 24, end: 26 },
]

export default function ScriptureMemory() {
  const [verseText, setVerseText] = useState('')
  const [revealed, setRevealed] = useState(true)
  const [practicing, setPracticing] = useState(false)

  // Get this week's verse
  const now = new Date()
  const weekOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))
  const verse = MEMORY_VERSES[weekOfYear % MEMORY_VERSES.length]

  useEffect(() => {
    getChapter(verse.book, verse.chapter)
      .then(data => {
        const text = data.verses
          .filter(v => v.verse >= verse.start && v.verse <= verse.end)
          .map(v => v.text)
          .join(' ')
        setVerseText(text)
      })
      .catch(() => setVerseText(''))
  }, [verse.book, verse.chapter, verse.start, verse.end])

  const navigate = useNavigate()
  const openInBible = () => {
    savePosition(verse.book, verse.chapter)
    navigate('/devotional?tab=bible')
  }

  if (!verseText) return null

  return (
    <motion.div
      className="rounded-2xl p-4"
      style={{ background: 'rgba(107, 141, 227, 0.08)', border: '1px solid rgba(107, 141, 227, 0.2)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: '#6B8DE3' }}>
          This Week's Verse
        </p>
        <button
          onClick={() => { setPracticing(!practicing); setRevealed(false) }}
          className="text-[12px] font-medium px-2 py-1 rounded-lg"
          style={{ background: practicing ? '#6B8DE320' : 'transparent', color: '#6B8DE3' }}
        >
          {practicing ? 'Exit' : 'Practice'}
        </button>
      </div>

      <button onClick={openInBible} className="text-[15px] font-semibold mb-1 flex items-center gap-1" style={{ color: '#6B8DE3' }}>
        {verse.ref}
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {practicing ? (
        <div>
          <p className="text-[13px] mb-3" style={{ color: 'var(--text-muted)' }}>
            Try to recite the verse from memory, then tap to check.
          </p>
          <motion.button
            onClick={() => setRevealed(!revealed)}
            className="w-full py-4 rounded-xl text-center"
            style={{ background: revealed ? 'transparent' : 'var(--bg-tertiary)', border: '1px dashed var(--border)' }}
            whileTap={{ scale: 0.98 }}
          >
            {revealed ? (
              <p className="text-[14px] italic leading-relaxed px-3" style={{ color: 'var(--text-primary)' }}>
                "{verseText}"
              </p>
            ) : (
              <p className="text-[14px]" style={{ color: '#6B8DE3' }}>
                Tap to reveal
              </p>
            )}
          </motion.button>
        </div>
      ) : (
        <p className="text-[14px] italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          "{verseText.length > 120 ? verseText.slice(0, 120) + '...' : verseText}"
        </p>
      )}
    </motion.div>
  )
}
