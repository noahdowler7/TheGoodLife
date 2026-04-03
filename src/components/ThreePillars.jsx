import { useState } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

const PILLARS = [
  {
    id: 'with',
    label: 'With Jesus',
    prompt: 'How was I with Jesus today?',
    description: 'Time in his presence — prayer, scripture, silence, worship',
    color: '#D4A843',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: 'becoming',
    label: 'Becoming Like Jesus',
    prompt: 'How am I becoming like Jesus?',
    description: 'Character growth — patience, love, humility, surrender',
    color: '#5BB98B',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: 'doing',
    label: 'Doing What Jesus Did',
    prompt: 'What did I do that Jesus would do?',
    description: 'Action — serving, loving, giving, sharing faith',
    color: '#6B8DE3',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
      </svg>
    ),
  },
]

export default function ThreePillars({ reflections, setReflections }) {
  const [expanded, setExpanded] = useState(false)
  const [activePillar, setActivePillar] = useState(null)
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const pillarData = reflections[todayStr]?.pillars || {}
  const filledCount = PILLARS.filter(p => pillarData[p.id]?.trim()).length

  const handleChange = (pillarId, text) => {
    setReflections(prev => ({
      ...prev,
      [todayStr]: {
        ...(prev[todayStr] || {}),
        pillars: {
          ...(prev[todayStr]?.pillars || {}),
          [pillarId]: text,
        },
      },
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden"
      style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left"
      >
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(212, 168, 67, 0.15)' }}>
          <svg className="w-5 h-5" style={{ color: '#D4A843' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            The Way of Jesus
          </p>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {filledCount === 0 ? 'Daily apprenticeship check-in' : `${filledCount}/3 reflections`}
          </p>
        </div>
        {filledCount === 3 && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#5BB98B' }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        <svg
          className="w-4 h-4 transition-transform"
          style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 space-y-3">
              <p className="text-[13px] italic leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                "A disciple is someone who is with Jesus, becoming like Jesus, and doing what Jesus did."
              </p>

              {PILLARS.map(pillar => {
                const isActive = activePillar === pillar.id
                const value = pillarData[pillar.id] || ''
                const hasContent = value.trim().length > 0

                return (
                  <div key={pillar.id}>
                    <button
                      onClick={() => setActivePillar(isActive ? null : pillar.id)}
                      className="w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-all"
                      style={{
                        background: hasContent ? `${pillar.color}10` : 'var(--bg-tertiary)',
                        border: isActive ? `2px solid ${pillar.color}` : '2px solid transparent',
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${pillar.color}20`, color: pillar.color }}
                      >
                        {pillar.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold" style={{ color: pillar.color }}>
                          {pillar.label}
                        </p>
                        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                          {hasContent ? value.slice(0, 80) + (value.length > 80 ? '...' : '') : pillar.description}
                        </p>
                      </div>
                      {hasContent && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: pillar.color }}>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="pt-2">
                            <p className="text-[13px] font-medium mb-2 px-1" style={{ color: pillar.color }}>
                              {pillar.prompt}
                            </p>
                            <textarea
                              value={value}
                              onChange={(e) => handleChange(pillar.id, e.target.value)}
                              placeholder={`Reflect on how you were ${pillar.label.toLowerCase()} today...`}
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl text-[14px] outline-none resize-none leading-relaxed"
                              style={{
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                border: `1px solid ${pillar.color}30`,
                              }}
                              ref={(el) => {
                                if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
