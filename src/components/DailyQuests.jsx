import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { generateDailyQuests, updateQuestProgress, XP_REWARDS } from '../utils/gamification'

// Map quest types to where the user can complete them
const QUEST_ROUTES = {
  complete_disciplines: '/today',
  bible_reading: '/devotional?tab=bible',
  prayer: '/today?capital=spiritual',
  earn_xp: null, // no specific route
  rate_capitals: '/today',
  complete_capital: '/today',
  reflection: '/devotional',
  streak_maintain: '/today',
  serve_others: '/today?capital=relational',
  exercise: '/today?capital=physical',
  fellowship: '/today?capital=relational',
  play_game: '__game__', // special: opens scripture game
}

const QUEST_ICONS = {
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  book: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  pray: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  star: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  crown: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
    </svg>
  ),
  pen: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  fire: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23a7.5 7.5 0 01-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.68.5 1.47.5 2.47 0 4.142-3.358 7.5-7.5 7.5z" />
    </svg>
  ),
  heart: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  run: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  people: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  game: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  ),
}

function DailyQuests({ gamification, setGamification, disciplines, ratings, reflections, compact = false, onPlayGame }) {
  const navigate = useNavigate()
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const gam = gamification || {}

  // Generate today's quests once — only regenerate if day changes
  const baseQuests = useMemo(() => generateDailyQuests(todayStr), [todayStr])

  // Use stored quests if available for today, otherwise use generated
  const storedQuests = gam.dailyQuests?.date === todayStr ? gam.dailyQuests.quests : null

  // Compute display progress from current app state (read-only, no persist)
  const todayXP = gam.todayXPDate === todayStr ? (gam.todayXP || 0) : 0
  const displayQuests = useMemo(
    () => updateQuestProgress(storedQuests || baseQuests, disciplines || {}, ratings || {}, reflections || {}, todayStr, todayXP),
    [storedQuests, baseQuests, disciplines, ratings, reflections, todayStr, todayXP]
  )

  const allComplete = displayQuests.every(q => q.completed)
  const chestClaimed = gam.dailyQuests?.chestClaimed && gam.dailyQuests?.date === todayStr

  const claimChest = () => {
    if (!allComplete || chestClaimed || !setGamification) return
    setGamification(prev => ({
      ...prev,
      xp: (prev.xp || 0) + XP_REWARDS.allQuestsComplete,
      todayXP: (prev.todayXPDate === todayStr ? (prev.todayXP || 0) : 0) + XP_REWARDS.allQuestsComplete,
      todayXPDate: todayStr,
      questsAllCompleted: (prev.questsAllCompleted || 0) + 1,
      dailyQuests: { ...prev.dailyQuests, chestClaimed: true },
    }))
  }

  if (compact) {
    const completedCount = displayQuests.filter(q => q.completed).length
    return (
      <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212, 168, 67, 0.15)' }}>
              <svg className="w-4 h-4" style={{ color: '#D4A843' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Daily Quests</span>
          </div>
          <span className="text-[12px] font-medium" style={{ color: completedCount === 3 ? '#5BB98B' : 'var(--text-muted)' }}>
            {completedCount}/3
          </span>
        </div>
        <div className="flex gap-2">
          {displayQuests.map((q, i) => (
            <div key={q.id} className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: q.completed ? '#5BB98B' : '#D4A843' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((q.progress / q.target) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold uppercase" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
          Daily Quests
        </h3>
        {allComplete && !chestClaimed && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={claimChest}
            className="px-3 py-1.5 rounded-xl text-[12px] font-semibold"
            style={{ background: 'rgba(212, 168, 67, 0.2)', color: '#D4A843' }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Claim Chest +{XP_REWARDS.allQuestsComplete} XP
          </motion.button>
        )}
        {chestClaimed && (
          <span className="text-[12px] font-medium" style={{ color: '#5BB98B' }}>Chest claimed!</span>
        )}
      </div>

      {displayQuests.map((quest) => {
        const route = QUEST_ROUTES[quest.type]
        const isTappable = !quest.completed && route

        const handleTap = () => {
          if (!isTappable) return
          if (route === '__game__') {
            if (onPlayGame) onPlayGame()
          } else {
            navigate(route)
          }
        }

        return (
          <motion.button
            key={quest.id}
            onClick={handleTap}
            className="w-full rounded-2xl p-4 flex items-center gap-3 text-left"
            style={{
              background: quest.completed ? 'rgba(91, 185, 139, 0.08)' : 'var(--bg-card)',
              border: `1px solid ${quest.completed ? 'rgba(91, 185, 139, 0.3)' : 'var(--border)'}`,
              cursor: isTappable ? 'pointer' : 'default',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={isTappable ? { scale: 0.98 } : {}}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: quest.completed ? 'rgba(91, 185, 139, 0.15)' : 'rgba(212, 168, 67, 0.15)',
                color: quest.completed ? '#5BB98B' : '#D4A843',
              }}
            >
              {quest.completed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                QUEST_ICONS[quest.icon] || QUEST_ICONS.star
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {quest.label}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: quest.completed ? '#5BB98B' : '#D4A843' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-[11px] font-medium flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {Math.min(quest.progress, quest.target)}/{quest.target}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[11px] font-semibold" style={{ color: '#D4A843' }}>
                +{quest.xpReward}
              </span>
              {isTappable && (
                <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

export default DailyQuests
