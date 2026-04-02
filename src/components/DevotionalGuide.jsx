import { useState, useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from './PageWrapper'
import { getDailyScripture, getDailyPrompt } from '../utils/scriptures'
import { CAPITALS } from '../utils/capitals'

function DevotionalGuide({ reflections, setReflections }) {
  const [tab, setTab] = useState('today')
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  const dailyScripture = useMemo(() => getDailyScripture(today), [todayStr])

  const todayPrompt = useMemo(() => getDailyPrompt(today), [todayStr])
  const capital = dailyScripture.capital ? CAPITALS[dailyScripture.capital] : null

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

  // Past 7 days of scriptures
  const pastScriptures = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, i + 1)
      return {
        date: format(date, 'yyyy-MM-dd'),
        dateLabel: format(date, 'EEEE, MMM d'),
        scripture: getDailyScripture(date),
        reflection: reflections[format(date, 'yyyy-MM-dd')]?.devotional || null,
      }
    })
  }, [todayStr, reflections])

  return (
    <PageWrapper className="min-h-screen pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-[28px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>Devotional</h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--text-tertiary)' }}>Scripture & reflection</p>
      </header>

      {/* Tabs */}
      <div className="px-5 mb-5">
        <div className="segmented-control">
          <button className={`segment ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}>
            Today
          </button>
          <button className={`segment ${tab === 'archive' ? 'active' : ''}`} onClick={() => setTab('archive')}>
            Archive
          </button>
        </div>
      </div>

      <div className="px-5 space-y-5">
        {tab === 'today' ? (
          <>
            {/* Today's Scripture - Large Display */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl py-10 px-6 text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <p className="text-[11px] tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
                  Today's Scripture
                </p>
                {capital && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${capital.color}20`, color: capital.color }}>
                    {capital.name}
                  </span>
                )}
              </div>
              <p className="text-[20px] italic leading-relaxed mb-6" style={{ color: 'var(--text-primary)', fontWeight: 400 }}>
                "{dailyScripture.verse}"
              </p>
              <p className="text-[13px] tracking-wider uppercase font-medium" style={{ color: 'var(--text-muted)' }}>
                {dailyScripture.reference}
              </p>
            </motion.div>

            {/* Reflection Prompt */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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

            {/* Journal Entry */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              />
              {devotionalReflection && (
                <p className="text-[12px] mt-2 text-right" style={{ color: 'var(--text-muted)' }}>
                  {devotionalReflection.length} characters
                </p>
              )}
            </motion.div>
          </>
        ) : (
          /* Archive - Past scriptures */
          <div className="space-y-4">
            {pastScriptures.map((entry) => (
              <motion.div
                key={entry.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  {entry.dateLabel}
                </p>
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

export default DevotionalGuide
