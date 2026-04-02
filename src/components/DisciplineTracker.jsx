import { useState, useMemo } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from './PageWrapper'
import { ProgressRing } from './CapitalCard'
import { CAPITALS, CAPITAL_ORDER, getDisciplinesForCapital } from '../utils/capitals'
import { getDailyCompletionRate } from '../utils/streaks'
import { DisciplineEnrichment, ENRICHED_DISCIPLINES } from './DisciplineEnrichments'

function DisciplineCheckItem({ discipline, checked, capitalColor, onToggle }) {
  return (
    <motion.button
      layout
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
      style={{ background: checked ? `${capitalColor}10` : 'transparent' }}
    >
      <div
        className={`checkbox ${checked ? 'checked' : ''}`}
        style={checked ? { background: capitalColor, borderColor: capitalColor } : { borderColor: capitalColor + '60' }}
      >
        {checked && (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span
        className="text-[15px] flex-1 text-left"
        style={{
          color: checked ? 'var(--text-tertiary)' : 'var(--text-primary)',
          opacity: checked ? 0.6 : 1,
        }}
      >
        {discipline.label}
      </span>
    </motion.button>
  )
}

const RATING_LABELS = { 1: 'Struggled', 2: 'Low', 3: 'Steady', 4: 'Strong', 5: 'Thriving' }

function CapitalRating({ value, color, onChange }) {
  return (
    <div className="px-4">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>Rate:</span>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              onClick={() => onChange(value === i ? 0 : i)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{
                background: i <= value ? color : 'var(--bg-tertiary)',
                border: `2px solid ${i <= value ? color : 'var(--border)'}`,
              }}
            >
              {i <= value && (
                <span className="text-[10px] font-bold text-white">{i}</span>
              )}
            </button>
          ))}
        </div>
        {value > 0 && (
          <span className="text-[11px] font-medium ml-1" style={{ color }}>{RATING_LABELS[value]}</span>
        )}
      </div>
    </div>
  )
}

const COMPLETION_MESSAGES = [
  { verse: "Well done, good and faithful servant.", ref: "Matthew 25:21" },
  { verse: "Let us not become weary in doing good, for at the proper time we will reap a harvest.", ref: "Galatians 6:9" },
  { verse: "Whatever you do, work at it with all your heart, as working for the Lord.", ref: "Colossians 3:23" },
  { verse: "Be faithful in small things, because it is in them that your strength lies.", ref: "Mother Teresa" },
  { verse: "The steadfast love of the Lord never ceases; his mercies never come to an end.", ref: "Lamentations 3:22" },
]

function CompletionCelebration() {
  const msg = COMPLETION_MESSAGES[new Date().getDay() % COMPLETION_MESSAGES.length]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl p-6 text-center mx-5 mb-6"
      style={{ background: 'var(--accent-light)', border: '2px solid var(--accent)' }}
    >
      <div className="text-3xl mb-3">&#10024;</div>
      <p className="text-[17px] font-semibold mb-2" style={{ color: 'var(--accent)' }}>
        You invested in all 5 capitals today
      </p>
      <p className="text-[15px] italic leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
        "{msg.verse}"
      </p>
      <p className="text-[11px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
        {msg.ref}
      </p>
    </motion.div>
  )
}

function ReflectionJournal({ value, color, onChange }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="px-4 mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-[13px] font-medium mb-2"
        style={{ color: color }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        {value ? 'Edit reflection' : 'Add reflection'}
        <motion.svg
          animate={{ rotate: expanded ? 180 : 0 }}
          className="w-3 h-3"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="How did you experience God in this area today?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-[14px] outline-none resize-none"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: `1px solid ${color}30`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

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

function PrayerACTS({ dateStr, reflections, setReflections, setDisciplines, onClose }) {
  const prayerActs = reflections[dateStr]?.prayer_acts || {}

  const handleChange = (stepId, text) => {
    const newActs = { ...prayerActs, [stepId]: text }
    setReflections(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), prayer_acts: newActs },
    }))
    const hasAny = Object.values(newActs).some(v => v?.trim())
    setDisciplines(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), prayer: hasAny },
    }))
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Prayer — ACTS
        </p>
        <button
          onClick={onClose}
          className="text-[12px] font-medium px-3 py-1 rounded-full"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
        >
          Close
        </button>
      </div>
      <div className="space-y-3">
        {ACTS_STEPS.map(step => (
          <div
            key={step.id}
            className="rounded-2xl p-3"
            style={{ background: 'var(--bg-tertiary)', border: `1px solid ${step.color}30` }}
          >
            <div className="flex items-start gap-3 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-[15px]"
                style={{ background: step.color }}
              >
                {step.letter}
              </div>
              <div>
                <p className="text-[14px] font-semibold" style={{ color: step.color }}>{step.title}</p>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.prompt}</p>
              </div>
            </div>
            <textarea
              value={prayerActs[step.id] || ''}
              onChange={(e) => handleChange(step.id, e.target.value)}
              placeholder={step.placeholder}
              rows={2}
              className="w-full px-3 py-2 rounded-xl text-[14px] outline-none resize-none leading-relaxed"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: `1px solid ${step.color}20`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const STEWARDSHIP_OPTIONS = [
  { id: 'gave', label: 'Gave generously', icon: '♥' },
  { id: 'spent_wisely', label: 'Spent wisely', icon: '✓' },
  { id: 'saved', label: 'Saved intentionally', icon: '↑' },
  { id: 'reviewed', label: 'Reviewed finances', icon: '◈' },
]

function FinancialStewardship({ dateStr, reflections, setReflections, setDisciplines }) {
  const stewardshipData = reflections[dateStr]?.financial_stewardship || {}

  const handleToggleOption = (optionId) => {
    const newData = { ...stewardshipData, [optionId]: !stewardshipData[optionId] }
    setReflections(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), financial_stewardship: newData },
    }))
    const hasAny = STEWARDSHIP_OPTIONS.some(o => newData[o.id])
    setDisciplines(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), stewardship: hasAny },
    }))
  }

  const handleNotesChange = (text) => {
    setReflections(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || {}),
        financial_stewardship: { ...stewardshipData, notes: text },
      },
    }))
  }

  return (
    <div className="px-4 py-3">
      <p className="text-[13px] font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
        How did you steward your resources today?
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {STEWARDSHIP_OPTIONS.map(option => {
          const selected = !!stewardshipData[option.id]
          return (
            <button
              key={option.id}
              onClick={() => handleToggleOption(option.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium transition-all"
              style={{
                background: selected ? '#B07EE020' : 'var(--bg-tertiary)',
                border: `2px solid ${selected ? '#B07EE0' : 'var(--border)'}`,
                color: selected ? '#B07EE0' : 'var(--text-secondary)',
              }}
            >
              <span>{option.icon}</span>
              {option.label}
            </button>
          )
        })}
      </div>
      <textarea
        value={stewardshipData.notes || ''}
        onChange={(e) => handleNotesChange(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        className="w-full px-3 py-2 rounded-xl text-[13px] outline-none resize-none"
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
        }}
      />
    </div>
  )
}

function DisciplineTracker({ disciplines, setDisciplines, reflections, setReflections, ratings, setRatings, settings, customDisciplines }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showEnrichment, setShowEnrichment] = useState(null)
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const capitalToggles = settings?.capitals || {}

  const dayData = disciplines[dateStr] || {}
  const dayRatings = ratings[dateStr] || {}
  const dayReflections = reflections[dateStr] || {}

  const completionRate = getDailyCompletionRate(disciplines, dateStr, capitalToggles, customDisciplines)

  const activeCapitals = CAPITAL_ORDER.filter(id => capitalToggles[id] !== false)

  const handleToggleDiscipline = (discId) => {
    setDisciplines(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || {}),
        [discId]: !(prev[dateStr]?.[discId]),
      },
    }))
  }

  const handleRatingChange = (capitalId, value) => {
    setRatings(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || {}),
        [capitalId]: value,
      },
    }))
  }

  const handleReflectionChange = (capitalId, text) => {
    setReflections(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || {}),
        [capitalId]: text,
      },
    }))
  }

  const navigateDate = (direction) => {
    setSelectedDate(prev => direction === 'next' ? addDays(prev, 1) : subDays(prev, 1))
    setShowEnrichment(null)
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  return (
    <PageWrapper className="min-h-screen pb-24">
      {/* Date Navigation */}
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateDate('prev')} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
            <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-[18px] font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {isToday ? 'Today' : format(selectedDate, 'EEEE')}
            </button>
            <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
          <button onClick={() => navigateDate('next')} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
            <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Overall Progress Ring */}
        <div className="flex justify-center">
          <div className="relative">
            <ProgressRing progress={completionRate} color="var(--accent)" size={80} strokeWidth={6} />
            <span className="absolute inset-0 flex items-center justify-center text-[18px] font-bold" style={{ color: 'var(--accent)' }}>
              {Math.round(completionRate * 100)}%
            </span>
          </div>
        </div>
      </header>

      {/* Completion Celebration */}
      <AnimatePresence>
        {completionRate === 1 && isToday && <CompletionCelebration />}
      </AnimatePresence>

      {/* Capital Sections */}
      <div className="px-5 space-y-6">
        {activeCapitals.map(capitalId => {
          const capital = CAPITALS[capitalId]
          const capitalDiscs = getDisciplinesForCapital(capitalId, customDisciplines)
          const completedCount = capitalDiscs.filter(d => dayData[d.id]).length

          return (
            <motion.section
              key={capitalId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--separator)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${capital.color}20` }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: capital.color }} />
                </div>
                <h3 className="text-[17px] font-semibold flex-1" style={{ color: capital.color, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.08em' }}>
                  {capital.name}
                </h3>
                <span className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  {completedCount}/{capitalDiscs.length}
                </span>
              </div>

              {/* Spiritual Practices */}
              {capitalId === 'financial' ? (
                <FinancialStewardship
                  dateStr={dateStr}
                  reflections={reflections}
                  setReflections={setReflections}
                  setDisciplines={setDisciplines}
                />
              ) : (
                <div className="py-1">
                  {capitalDiscs.map(disc => {
                    if (showEnrichment === disc.id) {
                      if (disc.id === 'prayer') {
                        return (
                          <PrayerACTS
                            key="prayer-acts"
                            dateStr={dateStr}
                            reflections={reflections}
                            setReflections={setReflections}
                            setDisciplines={setDisciplines}
                            onClose={() => setShowEnrichment(null)}
                          />
                        )
                      }
                      return (
                        <DisciplineEnrichment
                          key={`enrichment-${disc.id}`}
                          disciplineId={disc.id}
                          dateStr={dateStr}
                          reflections={reflections}
                          setReflections={setReflections}
                          setDisciplines={setDisciplines}
                          onClose={() => setShowEnrichment(null)}
                          color={capital.color}
                        />
                      )
                    }
                    return (
                      <DisciplineCheckItem
                        key={disc.id}
                        discipline={disc}
                        checked={!!dayData[disc.id]}
                        capitalColor={capital.color}
                        onToggle={() => ENRICHED_DISCIPLINES.has(disc.id)
                          ? setShowEnrichment(disc.id)
                          : handleToggleDiscipline(disc.id)
                        }
                      />
                    )
                  })}
                </div>
              )}

              {/* Rating */}
              <div className="py-2" style={{ borderTop: '1px solid var(--separator)' }}>
                <CapitalRating
                  value={dayRatings[capitalId] || 0}
                  color={capital.color}
                  onChange={(val) => handleRatingChange(capitalId, val)}
                />
              </div>

              {/* Reflection */}
              <div className="pb-3">
                <ReflectionJournal
                  value={dayReflections[capitalId] || ''}
                  color={capital.color}
                  onChange={(text) => handleReflectionChange(capitalId, text)}
                />
              </div>
            </motion.section>
          )
        })}

        <div className="h-4" />
      </div>
    </PageWrapper>
  )
}

export default DisciplineTracker
