import { useState } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

const PRACTICES = [
  { id: 'no_screens', label: 'No screens', icon: '📵' },
  { id: 'nature', label: 'Time in nature', icon: '🌿' },
  { id: 'family', label: 'Family time', icon: '👨‍👩‍👧‍👦' },
  { id: 'meal', label: 'Long meal', icon: '🍽️' },
  { id: 'worship', label: 'Worship', icon: '🎵' },
  { id: 'rest', label: 'Nap / Rest', icon: '😴' },
  { id: 'no_work', label: 'No work', icon: '✋' },
]

const SUGGESTIONS = [
  'Take a walk without your phone. Notice what God has made.',
  'Cook a meal from scratch. Invite someone to share it.',
  'Write a letter (on paper) to someone you love.',
  'Sit outside for 20 minutes. Don\'t produce. Just receive.',
  'Play a board game with your family. Laugh together.',
  'Visit a park or garden. Let creation speak to you.',
  'Read a book that has nothing to do with work.',
]

export default function SabbathCheckin({ reflections, setReflections, settings }) {
  const [expanded, setExpanded] = useState(false)
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const currentDay = today.getDay() // 0=Sun
  const sabbathDay = settings?.sabbathDay ?? 0 // default Sunday
  const isSabbath = currentDay === sabbathDay

  // Days until sabbath
  const daysUntil = ((sabbathDay - currentDay) + 7) % 7
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const sabbathData = reflections[todayStr]?.sabbath || {}
  const selectedPractices = sabbathData.practices || []
  const suggestion = SUGGESTIONS[today.getDate() % SUGGESTIONS.length]

  const togglePractice = (id) => {
    const updated = selectedPractices.includes(id)
      ? selectedPractices.filter(p => p !== id)
      : [...selectedPractices, id]
    setReflections(prev => ({
      ...prev,
      [todayStr]: {
        ...(prev[todayStr] || {}),
        sabbath: { ...(prev[todayStr]?.sabbath || {}), practices: updated, completed: updated.length > 0 },
      },
    }))
  }

  const handleNote = (text) => {
    setReflections(prev => ({
      ...prev,
      [todayStr]: {
        ...(prev[todayStr] || {}),
        sabbath: { ...(prev[todayStr]?.sabbath || {}), note: text },
      },
    }))
  }

  // Non-sabbath: small countdown
  if (!isSabbath) {
    return (
      <div className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(176, 126, 224, 0.15)' }}>
          <span className="text-[18px]">🕊️</span>
        </div>
        <div>
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Sabbath in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
          </p>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {dayNames[sabbathDay]} — a day to rest and receive
          </p>
        </div>
      </div>
    )
  }

  // Sabbath day: full card
  return (
    <motion.div
      className="rounded-2xl overflow-visible"
      style={{ background: 'rgba(176, 126, 224, 0.06)', border: '1px solid rgba(176, 126, 224, 0.2)' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(176, 126, 224, 0.15)' }}>
          <span className="text-[18px]">🕊️</span>
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold" style={{ color: '#B07EE0' }}>It's Sabbath</p>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {selectedPractices.length > 0 ? `${selectedPractices.length} practices today` : 'How will you rest today?'}
          </p>
        </div>
        <svg
          className="w-4 h-4 transition-transform"
          style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(176, 126, 224, 0.08)' }}>
            <p className="text-[12px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#B07EE0' }}>Suggestion</p>
            <p className="text-[13px] italic" style={{ color: 'var(--text-secondary)' }}>{suggestion}</p>
          </div>

          <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>How are you resting?</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRACTICES.map(p => {
              const sel = selectedPractices.includes(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => togglePractice(p.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium"
                  style={{
                    background: sel ? '#B07EE020' : 'var(--bg-tertiary)',
                    border: `2px solid ${sel ? '#B07EE0' : 'var(--border)'}`,
                    color: sel ? '#B07EE0' : 'var(--text-secondary)',
                  }}
                >
                  <span>{p.icon}</span> {p.label}
                </button>
              )
            })}
          </div>

          <textarea
            value={sabbathData.note || ''}
            onChange={(e) => handleNote(e.target.value)}
            placeholder="How are you resting today? (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-xl text-[13px] outline-none resize-none"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          />
        </div>
      )}
    </motion.div>
  )
}
