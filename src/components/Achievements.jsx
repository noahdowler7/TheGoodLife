import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ACHIEVEMENTS } from '../utils/gamification'

const ACHIEVEMENT_ICONS = {
  fire: (color) => (
    <svg className="w-6 h-6" style={{ color }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23a7.5 7.5 0 01-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.68.5 1.47.5 2.47 0 4.142-3.358 7.5-7.5 7.5z" />
    </svg>
  ),
  crown: (color) => (
    <svg className="w-6 h-6" style={{ color }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
    </svg>
  ),
  star: (color) => (
    <svg className="w-6 h-6" style={{ color }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  trophy: (color) => (
    <svg className="w-6 h-6" style={{ color }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  ),
  check: (color) => (
    <svg className="w-6 h-6" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  medal: (color) => (
    <svg className="w-6 h-6" style={{ color }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  chest: (color) => (
    <svg className="w-6 h-6" style={{ color }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z" />
    </svg>
  ),
  people: (color) => (
    <svg className="w-6 h-6" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  handshake: (color) => (
    <svg className="w-6 h-6" style={{ color }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  ),
  shield: (color) => (
    <svg className="w-6 h-6" style={{ color }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  ),
  diamond: (color) => (
    <svg className="w-6 h-6" style={{ color }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5L2 9l10 12L22 9l-3-6zM9.62 8l1.5-3h1.76l1.5 3H9.62z" />
    </svg>
  ),
  game: (color) => (
    <svg className="w-6 h-6" style={{ color }} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2z" />
    </svg>
  ),
}

const CATEGORY_COLORS = {
  streak: '#E8873D',
  xp: '#D4A843',
  discipline: '#5BB98B',
  special: '#B07EE0',
  social: '#E07B6A',
  league: '#6B8DE3',
  games: '#6BB5FF',
}

const CATEGORY_LABELS = {
  streak: 'Streaks',
  xp: 'Experience',
  discipline: 'Disciplines',
  special: 'Special',
  social: 'Community',
  league: 'League',
  games: 'Games',
}

function Achievements({ gamification }) {
  const unlockedIds = useMemo(
    () => new Set((gamification.achievements || []).map(a => a.id)),
    [gamification.achievements]
  )

  const unlockedCount = unlockedIds.size
  const totalCount = ACHIEVEMENTS.length

  // Group by category
  const grouped = useMemo(() => {
    const groups = {}
    for (const a of ACHIEVEMENTS) {
      if (!groups[a.category]) groups[a.category] = []
      groups[a.category].push({ ...a, unlocked: unlockedIds.has(a.id) })
    }
    return groups
  }, [unlockedIds])

  const categoryOrder = ['streak', 'xp', 'discipline', 'special', 'social', 'league', 'games']

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="rounded-2xl p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-[28px] font-bold" style={{ color: '#D4A843', fontFamily: "'Bebas Neue', sans-serif" }}>
          {unlockedCount}/{totalCount}
        </p>
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Achievements Unlocked</p>
        <div className="h-2 rounded-full overflow-hidden mt-3" style={{ background: 'var(--bg-tertiary)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #D4A843, #E8C76A)' }}
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Categories */}
      {categoryOrder.map(category => {
        const achievements = grouped[category]
        if (!achievements) return null
        const color = CATEGORY_COLORS[category]

        return (
          <div key={category}>
            <h3 className="text-[14px] font-semibold uppercase mb-3 px-1 flex items-center gap-2" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {achievements.map((achievement) => {
                const iconFn = ACHIEVEMENT_ICONS[achievement.icon] || ACHIEVEMENT_ICONS.star
                return (
                  <motion.div
                    key={achievement.id}
                    className="rounded-2xl p-3 flex items-center gap-3"
                    style={{
                      background: achievement.unlocked ? `${color}10` : 'var(--bg-card)',
                      border: `1px solid ${achievement.unlocked ? `${color}30` : 'var(--border)'}`,
                      opacity: achievement.unlocked ? 1 : 0.5,
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: achievement.unlocked ? 1 : 0.5, scale: 1 }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                      background: achievement.unlocked ? `${color}20` : 'var(--bg-tertiary)',
                    }}>
                      {achievement.unlocked ? iconFn(color) : (
                        <svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: achievement.unlocked ? color : 'var(--text-muted)' }}>
                        {achievement.name}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                        {achievement.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Achievements
