import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getBibleIndex, getChapter, getLastPosition, savePosition } from '../utils/bible'

function BibleReader({ navigateTo }) {
  const [index, setIndex] = useState(null)
  const [view, setView] = useState('reading') // 'books' | 'chapters' | 'reading'
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [chapterData, setChapterData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [highlightedVerse, setHighlightedVerse] = useState(null)
  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [speakingVerse, setSpeakingVerse] = useState(null)

  // Load index and last position on mount
  useEffect(() => {
    async function init() {
      try {
        const idx = await getBibleIndex()
        setIndex(idx)
        const pos = getLastPosition()
        const book = idx.find(b => b.id === pos.bookId) || idx[0]
        setSelectedBook(book)
        setSelectedChapter(pos.chapter)
      } catch (e) {
        console.error('Failed to load Bible index:', e)
      }
    }
    init()
  }, [])

  // Navigate to a specific book/chapter when navigateTo prop changes
  useEffect(() => {
    if (!navigateTo || !index) return
    const book = index.find(b => b.id === navigateTo.bookId)
    if (book) {
      setSelectedBook(book)
      setSelectedChapter(navigateTo.chapter)
      setView('reading')
    }
  }, [navigateTo, index])

  // Stop TTS on chapter change or unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
        setSpeaking(false)
        setSpeakingVerse(null)
      }
    }
  }, [selectedBook, selectedChapter])

  const handleListen = useCallback(() => {
    const synth = window.speechSynthesis
    if (!synth || !chapterData?.verses?.length) return

    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      setSpeakingVerse(null)
      return
    }

    setSpeaking(true)
    const verses = chapterData.verses
    let i = 0

    const speakNext = () => {
      if (i >= verses.length) {
        setSpeaking(false)
        setSpeakingVerse(null)
        return
      }
      const utt = new SpeechSynthesisUtterance(verses[i].text)
      utt.rate = 0.9
      utt.pitch = 1
      const currentVerse = verses[i].verse
      setSpeakingVerse(currentVerse)
      utt.onend = () => {
        i++
        speakNext()
      }
      utt.onerror = () => {
        setSpeaking(false)
        setSpeakingVerse(null)
      }
      synth.speak(utt)
    }
    speakNext()
  }, [chapterData, speaking])

  // Load chapter when book/chapter changes
  useEffect(() => {
    if (!selectedBook) return
    setLoading(true)
    setHighlightedVerse(null)
    getChapter(selectedBook.id, selectedChapter)
      .then(data => {
        setChapterData(data)
        savePosition(selectedBook.id, selectedChapter)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedBook, selectedChapter])

  const handleSelectBook = (book) => {
    setSelectedBook(book)
    setView('chapters')
  }

  const handleSelectChapter = (ch) => {
    setSelectedChapter(ch)
    setView('reading')
  }

  const handlePrevChapter = useCallback(() => {
    if (!index || !selectedBook) return
    if (selectedChapter > 1) {
      setSelectedChapter(prev => prev - 1)
    } else {
      const currentIdx = index.findIndex(b => b.id === selectedBook.id)
      if (currentIdx > 0) {
        const prevBook = index[currentIdx - 1]
        setSelectedBook(prevBook)
        setSelectedChapter(prevBook.chapters)
      }
    }
  }, [index, selectedBook, selectedChapter])

  const handleNextChapter = useCallback(() => {
    if (!index || !selectedBook) return
    if (selectedChapter < selectedBook.chapters) {
      setSelectedChapter(prev => prev + 1)
    } else {
      const currentIdx = index.findIndex(b => b.id === selectedBook.id)
      if (currentIdx < index.length - 1) {
        setSelectedBook(index[currentIdx + 1])
        setSelectedChapter(1)
      }
    }
  }, [index, selectedBook, selectedChapter])

  const handleCopyVerse = async (verse) => {
    if (!chapterData || !navigator.clipboard) return
    const text = `${chapterData.book} ${chapterData.chapter}:${verse.verse} — "${verse.text}"`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!index) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>Loading Bible...</p>
      </div>
    )
  }

  // === BOOK LIST VIEW ===
  if (view === 'books') {
    const otBooks = index.filter(b => b.testament === 'OT')
    const ntBooks = index.filter(b => b.testament === 'NT')

    return (
      <div>
        <button
          onClick={() => setView('reading')}
          className="flex items-center gap-2 mb-4 text-[14px] font-medium"
          style={{ color: 'var(--accent)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to reading
        </button>

        <p className="text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Old Testament</p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {otBooks.map(book => (
            <button
              key={book.id}
              onClick={() => handleSelectBook(book)}
              className="px-2 py-2 rounded-xl text-[13px] font-medium text-left truncate"
              style={{
                background: selectedBook?.id === book.id ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                color: selectedBook?.id === book.id ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              {book.name}
            </button>
          ))}
        </div>

        <p className="text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>New Testament</p>
        <div className="grid grid-cols-3 gap-2">
          {ntBooks.map(book => (
            <button
              key={book.id}
              onClick={() => handleSelectBook(book)}
              className="px-2 py-2 rounded-xl text-[13px] font-medium text-left truncate"
              style={{
                background: selectedBook?.id === book.id ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                color: selectedBook?.id === book.id ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              {book.name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // === CHAPTER SELECT VIEW ===
  if (view === 'chapters' && selectedBook) {
    return (
      <div>
        <button
          onClick={() => setView('books')}
          className="flex items-center gap-2 mb-4 text-[14px] font-medium"
          style={{ color: 'var(--accent)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {selectedBook.name}
        </button>

        <p className="text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Select Chapter
        </p>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(ch => (
            <button
              key={ch}
              onClick={() => handleSelectChapter(ch)}
              className="py-3 rounded-xl text-[15px] font-medium"
              style={{
                background: ch === selectedChapter ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                color: ch === selectedChapter ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // === READING VIEW ===
  return (
    <div>
      {/* Chapter Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setView('books')}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <h2 className="text-[22px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.04em' }}>
            {selectedBook?.name} {selectedChapter}
          </h2>
        </button>
        {window.speechSynthesis && (
          <button
            onClick={handleListen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium"
            style={{
              background: speaking ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: speaking ? 'white' : 'var(--text-secondary)',
            }}
          >
            {speaking ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                Stop
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Listen
              </>
            )}
          </button>
        )}
      </div>

      {/* Verses */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="leading-[1.85] text-[16px] mb-8"
          style={{ color: 'var(--text-primary)', fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          {chapterData?.verses.map(v => (
            <span
              key={v.verse}
              onClick={() => setHighlightedVerse(highlightedVerse === v.verse ? null : v.verse)}
              className="cursor-pointer transition-colors"
              style={{
                background: speakingVerse === v.verse ? 'rgba(107, 141, 227, 0.2)' : highlightedVerse === v.verse ? 'rgba(212, 168, 67, 0.2)' : 'transparent',
                borderRadius: (speakingVerse === v.verse || highlightedVerse === v.verse) ? '4px' : '0',
                padding: (speakingVerse === v.verse || highlightedVerse === v.verse) ? '2px 0' : '0',
              }}
            >
              <sup
                className="text-[10px] font-sans font-bold mr-0.5 select-none"
                style={{ color: 'var(--text-muted)' }}
              >
                {v.verse}
              </sup>
              {v.text}{' '}
            </span>
          ))}
        </motion.div>
      )}

      {/* Copy action for highlighted verse */}
      {highlightedVerse && chapterData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-5 right-5 z-50"
        >
          <button
            onClick={() => handleCopyVerse(chapterData.verses.find(v => v.verse === highlightedVerse))}
            className="w-full py-3 rounded-2xl text-[14px] font-medium flex items-center justify-center gap-2"
            style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
          >
            {copied ? 'Copied!' : `Copy ${selectedBook?.name} ${selectedChapter}:${highlightedVerse}`}
          </button>
        </motion.div>
      )}

      {/* Chapter Navigation */}
      <div className="flex items-center justify-between pt-4 pb-2" style={{ borderTop: '1px solid var(--separator)' }}>
        <button
          onClick={handlePrevChapter}
          disabled={index[0].id === selectedBook?.id && selectedChapter === 1}
          className="flex items-center gap-1 text-[14px] font-medium disabled:opacity-30"
          style={{ color: 'var(--accent)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <button
          onClick={() => setView('chapters')}
          className="text-[13px] font-medium px-3 py-1 rounded-full"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
        >
          Ch. {selectedChapter} of {selectedBook?.chapters}
        </button>

        <button
          onClick={handleNextChapter}
          disabled={index[index.length - 1].id === selectedBook?.id && selectedChapter === selectedBook?.chapters}
          className="flex items-center gap-1 text-[14px] font-medium disabled:opacity-30"
          style={{ color: 'var(--accent)' }}
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default BibleReader
