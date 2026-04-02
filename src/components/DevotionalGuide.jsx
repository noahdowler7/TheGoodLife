import { useState, useMemo, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from './PageWrapper'
import BibleReader from './BibleReader'
import { getDailyScripture, getDailyPrompt } from '../utils/scriptures'
import { getDailyExposition, getDailyCrossRefs, getDailyReading, DISCIPLESHIP_TEACHINGS } from '../utils/devotional'
import { CAPITALS } from '../utils/capitals'
import { parseScriptureRef } from '../utils/bible'

function DevotionalGuide({ reflections, setReflections }) {
  const [tab, setTab] = useState('today')
  const [bibleNavTarget, setBibleNavTarget] = useState(null)

  const openInBible = (reference) => {
    const parsed = parseScriptureRef(reference)
    if (parsed) {
      setBibleNavTarget({ ...parsed, _ts: Date.now() })
      setTab('bible')
    }
  }
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  // Spurgeon's Morning and Evening
  const [spurgeon, setSpurgeon] = useState(null)
  const [spurgeonExpanded, setSpurgeonExpanded] = useState(false)
  const isEvening = today.getHours() >= 17

  useEffect(() => {
    fetch('/devotionals/spurgeon-morning-evening.json')
      .then(r => r.json())
      .then(data => {
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
        const dateKey = `${months[today.getMonth()]} ${today.getDate()}`
        const entry = data.find(d => d.date === dateKey)
        if (entry) setSpurgeon(entry)
      })
      .catch(() => {})
  }, [todayStr])

  const dailyScripture = useMemo(() => getDailyScripture(today), [todayStr])
  const todayPrompt = useMemo(() => getDailyPrompt(today), [todayStr])
  const capital = dailyScripture.capital ? CAPITALS[dailyScripture.capital] : null
  const capitalId = dailyScripture.capital || 'spiritual'

  const exposition = useMemo(() => getDailyExposition(today)(capitalId), [todayStr, capitalId])
  const crossRefs = useMemo(() => getDailyCrossRefs(today)(capitalId), [todayStr, capitalId])
  const dailyReading = useMemo(() => getDailyReading(today)(capitalId), [todayStr, capitalId])

  const devotionalReflection = reflections[todayStr]?.devotional || ''

  const handleReflectionChange = (text) => {
    setReflections(prev => ({
      ...prev,
      [todayStr]: {
        ...(prev[todayStr] || {}),
        devotional: text,
      },
    }))
  }

  // Past 7 days
  const pastScriptures = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, i + 1)
      const scripture = getDailyScripture(date)
      return {
        date: format(date, 'yyyy-MM-dd'),
        dateLabel: format(date, 'EEEE, MMM d'),
        scripture,
        capital: scripture.capital ? CAPITALS[scripture.capital] : null,
        reflection: reflections[format(date, 'yyyy-MM-dd')]?.devotional || null,
      }
    })
  }, [todayStr, reflections])

  // Current discipleship teaching (rotates weekly)
  const weeklyTeaching = useMemo(() => {
    const weekOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))
    return DISCIPLESHIP_TEACHINGS[weekOfYear % DISCIPLESHIP_TEACHINGS.length]
  }, [todayStr])

  return (
    <PageWrapper className="min-h-screen pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-[28px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>The Word</h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--text-tertiary)' }}>Scripture, exposition & discipleship</p>
      </header>

      {/* Tabs */}
      <div className="px-5 mb-5">
        <div className="segmented-control">
          {['today', 'bible', 'discipleship', 'archive'].map(t => (
            <button key={t} className={`segment ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'today' ? 'Today' : t === 'bible' ? 'Bible' : t === 'discipleship' ? 'Grow' : 'Archive'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-5">
        {tab === 'bible' && (
          <BibleReader navigateTo={bibleNavTarget} />
        )}
        {tab === 'today' && (
          <>
            {/* Scripture Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl py-8 px-6 text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-center gap-2 mb-5">
                <p className="text-[11px] tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
                  Today's Scripture
                </p>
                {capital && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${capital.color}20`, color: capital.color }}>
                    {capital.name}
                  </span>
                )}
              </div>
              <p className="text-[20px] italic leading-relaxed mb-5" style={{ color: 'var(--text-primary)', fontWeight: 400 }}>
                "{dailyScripture.verse}"
              </p>
              <button
                onClick={() => openInBible(dailyScripture.reference)}
                className="text-[13px] tracking-wider uppercase font-medium flex items-center gap-1 mx-auto"
                style={{ color: 'var(--accent)' }}
              >
                {dailyScripture.reference}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.div>

            {/* Exposition */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl p-5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: capital?.color || 'var(--accent)' }}>
                Devotional Thought
              </p>
              <p className="text-[15px] leading-[1.7]" style={{ color: 'var(--text-secondary)' }}>
                {exposition}
              </p>
            </motion.div>

            {/* Cross References */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Go Deeper
              </p>
              <div className="space-y-3">
                {crossRefs.map((ref, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${capital?.color || 'var(--accent)'}15` }}>
                      <span className="text-[10px] font-bold" style={{ color: capital?.color || 'var(--accent)' }}>{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        "{ref.text}"
                      </p>
                      <button
                        onClick={() => openInBible(ref.ref)}
                        className="text-[11px] mt-1 tracking-wider uppercase flex items-center gap-1"
                        style={{ color: capital?.color || 'var(--accent)' }}
                      >
                        {ref.ref}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Daily Reading Suggestion */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => openInBible(dailyReading)}
              className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
              style={{ background: `${capital?.color || 'var(--accent)'}10`, border: `1px solid ${capital?.color || 'var(--accent)'}30` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${capital?.color || 'var(--accent)'}20` }}>
                <svg className="w-5 h-5" style={{ color: capital?.color || 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: capital?.color || 'var(--accent)' }}>
                  Today's Reading
                </p>
                <p className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {dailyReading}
                </p>
              </div>
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: capital?.color || 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>

            {/* Reflection Prompt */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-4"
              style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)30' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
                Reflection Prompt
              </p>
              <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {todayPrompt}
              </p>
            </motion.div>

            {/* Spurgeon's Morning and Evening */}
            {spurgeon && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => setSpurgeonExpanded(!spurgeonExpanded)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(176, 126, 224, 0.15)' }}>
                    <svg className="w-5 h-5" style={{ color: '#B07EE0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: '#B07EE0' }}>
                      Spurgeon's {isEvening ? 'Evening' : 'Morning'} Devotional
                    </p>
                    <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {isEvening ? spurgeon.evening.verse?.slice(0, 60) : spurgeon.morning.verse?.slice(0, 60)}...
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 transition-transform flex-shrink-0"
                    style={{ color: 'var(--text-muted)', transform: spurgeonExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {spurgeonExpanded && (
                  <div className="px-4 pb-4">
                    <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(176, 126, 224, 0.08)' }}>
                      <p className="text-[13px] italic leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {isEvening ? spurgeon.evening.verse : spurgeon.morning.verse}
                      </p>
                    </div>
                    <p className="text-[14px] leading-[1.75] whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                      {isEvening ? spurgeon.evening.text : spurgeon.morning.text}
                    </p>
                    {/* Toggle to see the other reading */}
                    <button
                      onClick={(e) => { e.stopPropagation() }}
                      className="mt-4 text-[12px] font-medium"
                      style={{ color: '#B07EE0' }}
                      onClickCapture={() => {
                        // Simple trick: show the other one
                        const el = document.getElementById('spurgeon-other')
                        if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'
                      }}
                    >
                      Read {isEvening ? 'Morning' : 'Evening'} Devotional
                    </button>
                    <div id="spurgeon-other" style={{ display: 'none' }} className="mt-3">
                      <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(176, 126, 224, 0.08)' }}>
                        <p className="text-[13px] italic leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {isEvening ? spurgeon.morning.verse : spurgeon.evening.verse}
                        </p>
                      </div>
                      <p className="text-[14px] leading-[1.75] whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                        {isEvening ? spurgeon.morning.text : spurgeon.evening.text}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Journal Entry */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-[15px] font-semibold uppercase mb-3" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
                Your Reflection
              </h3>
              <textarea
                value={devotionalReflection}
                onChange={(e) => handleReflectionChange(e.target.value)}
                placeholder="Write your thoughts, prayers, and reflections here..."
                rows={6}
                className="w-full px-5 py-4 rounded-2xl text-[15px] outline-none resize-none leading-relaxed"
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              />
              {devotionalReflection && (
                <p className="text-[12px] mt-2 text-right" style={{ color: 'var(--text-muted)' }}>
                  {devotionalReflection.length} characters
                </p>
              )}
            </motion.div>
          </>
        )}

        {tab === 'discipleship' && (
          <>
            {/* Weekly Teaching */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-6"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {(() => {
                const teachCapital = CAPITALS[weeklyTeaching.capital]
                return (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full" style={{ background: teachCapital?.color }} />
                      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: teachCapital?.color }}>
                        This Week's Focus
                      </p>
                    </div>
                    <h2 className="text-[22px] font-semibold mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}>
                      {weeklyTeaching.title}
                    </h2>
                    <p className="text-[15px] leading-[1.75] mb-6" style={{ color: 'var(--text-secondary)' }}>
                      {weeklyTeaching.teaching}
                    </p>

                    {/* Key Verse */}
                    <div className="rounded-xl p-4 mb-5" style={{ background: `${teachCapital?.color}10`, border: `1px solid ${teachCapital?.color}30` }}>
                      <p className="text-[14px] italic leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        "{weeklyTeaching.keyVerse}"
                      </p>
                    </div>

                    {/* Practice */}
                    <div className="rounded-xl p-4" style={{ background: 'var(--bg-tertiary)' }}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
                        Practice This Week
                      </p>
                      <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {weeklyTeaching.practice}
                      </p>
                    </div>
                  </>
                )
              })()}
            </motion.div>

            {/* All Five Capitals Summaries */}
            <h3 className="text-[15px] font-semibold uppercase" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
              The Five Capitals
            </h3>
            {DISCIPLESHIP_TEACHINGS.map((teaching, i) => {
              const tc = CAPITALS[teaching.capital]
              return (
                <ExpandableTeaching key={i} teaching={teaching} capital={tc} />
              )
            })}
          </>
        )}

        {tab === 'archive' && (
          <div className="space-y-4">
            {pastScriptures.map((entry) => (
              <motion.div
                key={entry.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {entry.dateLabel}
                  </p>
                  {entry.capital && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${entry.capital.color}20`, color: entry.capital.color }}>
                      {entry.capital.name}
                    </span>
                  )}
                </div>
                <p className="text-[15px] italic leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
                  "{entry.scripture.verse}"
                </p>
                <p className="text-[11px] tracking-widest uppercase mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  {entry.scripture.reference}
                </p>
                {entry.reflection && (
                  <div className="pt-3" style={{ borderTop: '1px solid var(--separator)' }}>
                    <p className="text-[11px] font-medium uppercase mb-1" style={{ color: 'var(--accent)' }}>Your reflection</p>
                    <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {entry.reflection}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div className="h-4" />
      </div>
    </PageWrapper>
  )
}

function ExpandableTeaching({ teaching, capital }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${capital?.color}20` }}>
          <div className="w-3 h-3 rounded-full" style={{ background: capital?.color }} />
        </div>
        <span className="flex-1 text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {teaching.title}
        </span>
        <svg
          className="w-4 h-4 transition-transform"
          style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <p className="text-[14px] leading-[1.7]" style={{ color: 'var(--text-secondary)' }}>
                {teaching.teaching}
              </p>
              <div className="rounded-xl p-3" style={{ background: `${capital?.color}10` }}>
                <p className="text-[13px] italic leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  "{teaching.keyVerse}"
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--bg-tertiary)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>Practice</p>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {teaching.practice}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default DevotionalGuide
