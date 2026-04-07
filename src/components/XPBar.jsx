import { motion } from 'framer-motion'
import { getLevelProgress } from '../utils/gamification'

function XPBar({ gamification, compact = false }) {
  const { level, progress, needed, percent } = getLevelProgress(gamification.xp || 0)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
          style={{ background: 'rgba(212, 168, 67, 0.2)', color: '#D4A843' }}>
          {level}
        </div>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #D4A843, #E8C76A)' }}
            initial={{ width: 0 }}
            animate={{ width: `${percent * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
          {gamification.xp || 0} XP
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #D4A843, #E8C76A)' }}
          >
            <span className="text-[16px] font-bold text-white">{level}</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Level {level}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{gamification.xp || 0} total XP</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-semibold" style={{ color: '#D4A843' }}>{progress}/{needed}</p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>to next level</p>
        </div>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #D4A843, #E8C76A)' }}
          initial={{ width: 0 }}
          animate={{ width: `${percent * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {gamification.streakFreezes > 0 && (
        <div className="flex items-center gap-1.5 mt-3">
          <svg className="w-4 h-4" style={{ color: '#6BB5FF' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {gamification.streakFreezes} grace freeze{gamification.streakFreezes !== 1 ? 's' : ''} available
          </span>
        </div>
      )}
    </div>
  )
}

export default XPBar
