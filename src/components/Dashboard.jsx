import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import PageWrapper from './PageWrapper'
import CapitalCard from './CapitalCard'
import StreakIndicator from './StreakIndicator'
import InsightsCard from './InsightsCard'
import AlignmentWidget from './AlignmentWidget'
import { getDailyScripture } from '../utils/scriptures'
import { CAPITALS, CAPITAL_ORDER, getActiveDisciplines } from '../utils/capitals'
import { calculateCapitalScore, getActiveStreaks, getDailyCompletionRate } from '../utils/streaks'
import { ALL_DISCIPLINES } from '../utils/capitals'

function Dashboard({ disciplines, ratings, settings, setDisciplines, customDisciplines }) {
  const navigate = useNavigate()
  const today = new Date()
  const hour = today.getHours()
  const todayStr = format(today, 'yyyy-MM-dd')
  const capitalToggles = settings?.capitals || {}

  const greeting = useMemo(() => {
    if (hour < 12) return { text: 'Good Morning', subtext: 'Walk boldly into your day' }
    if (hour < 17) return { text: 'Good Afternoon', subtext: 'Keep growing into who God created you to be' }
    return { text: 'Good Evening', subtext: 'Rest in what God has done today' }
  }, [hour])

  const userName = settings?.currentUser?.name
  const dailyScripture = useMemo(() => getDailyScripture(today), [todayStr])

  // Capital scores for today
  const capitalScores = useMemo(() => {
    return CAPITAL_ORDER
      .filter(id => capitalToggles[id] !== false)
      .map(id => ({
        id,
        ...calculateCapitalScore(id, disciplines, ratings, todayStr, customDisciplines),
      }))
  }, [disciplines, ratings, todayStr, capitalToggles, customDisciplines])

  // Uncompleted disciplines to grow in
  const activeDisciplines = useMemo(() => {
    return getActiveDisciplines(capitalToggles, customDisciplines)
  }, [capitalToggles, customDisciplines])

  const todayData = disciplines[todayStr] || {}
  const uncompletedDisciplines = activeDisciplines.filter(d => !todayData[d.id]).slice(0, 5)

  // Toggle a discipline from the dashboard
  const handleToggleDiscipline = (discId) => {
    setDisciplines(prev => ({
      ...prev,
      [todayStr]: {
        ...(prev[todayStr] || {}),
        [discId]: !(prev[todayStr]?.[discId]),
      },
    }))
  }

  // Active streaks
  const streaks = useMemo(() => getActiveStreaks(disciplines).slice(0, 3), [disciplines])

  // Find discipline label by id
  const getDisciplineLabel = (id) => {
    const found = ALL_DISCIPLINES.find(d => d.id === id)
    if (found) return found.label
    const custom = customDisciplines?.find(d => d.id === id)
    return custom?.label || id
  }

  const overallCompletion = getDailyCompletionRate(disciplines, todayStr, capitalToggles, customDisciplines)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <PageWrapper className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <p className="text-[14px] text-tertiary font-medium">{format(today, 'EEEE, MMMM d')}</p>
            <h1 className="text-[28px] font-semibold mt-1" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
              {greeting.text}{userName ? `, ${userName}` : ''}
            </h1>
            <p className="text-[15px] text-tertiary mt-0.5">{greeting.subtext}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/settings')}
            className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: settings?.profilePicture ? 'transparent' : 'var(--bg-tertiary)',
              border: '2px solid var(--border)'
            }}
          >
            {settings?.profilePicture ? (
              <img src={settings.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </motion.button>
        </motion.div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-5 space-y-5"
      >
        {/* Five Capital Progress Rings */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[15px] font-semibold uppercase" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
              Five Capitals
            </h2>
            <span className="text-[13px] font-medium" style={{ color: 'var(--accent)' }}>
              {Math.round(overallCompletion * 100)}% today
            </span>
          </div>
          <div className="flex items-center justify-between overflow-x-auto scrollbar-hide gap-2 py-2">
            {capitalScores.map(score => (
              <CapitalCard
                key={score.id}
                capitalId={score.id}
                completionRate={score.completionRate}
                rating={score.rating}
                compact
              />
            ))}
          </div>
        </motion.section>

        {/* Today's Disciplines (Quick Access) */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[15px] font-semibold uppercase" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
              Up Next
            </h2>
            <button
              onClick={() => navigate('/today')}
              className="text-[13px] font-medium"
              style={{ color: 'var(--accent)' }}
            >
              See all
            </button>
          </div>

          {uncompletedDisciplines.length > 0 ? (
            <div className="space-y-2">
              {uncompletedDisciplines.map((disc) => {
                const capital = CAPITALS[disc.capitalId]
                return (
                  <motion.div
                    key={disc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="home-card flex items-center gap-4 cursor-pointer"
                    onClick={() => handleToggleDiscipline(disc.id)}
                  >
                    <div
                      className="w-6 h-6 rounded-full border-2 flex-shrink-0"
                      style={{ borderColor: capital?.color || 'var(--text-muted)' }}
                    />
                    <p className="flex-1 text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {disc.label}
                    </p>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${capital?.color}20`, color: capital?.color }}>
                      {capital?.name}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="home-card text-center py-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--accent-light)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>
                A beautiful day of faithfulness!
              </p>
            </div>
          )}
        </motion.section>

        {/* Active Streaks */}
        {streaks.length > 0 && (
          <motion.section variants={itemVariants}>
            <h2 className="text-[15px] font-semibold uppercase mb-3 px-1" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
              Active Streaks
            </h2>
            <div className="flex flex-wrap gap-2">
              {streaks.map(s => (
                <StreakIndicator
                  key={s.disciplineId}
                  count={s.count}
                  label={getDisciplineLabel(s.disciplineId)}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Alignment Score */}
        <motion.section variants={itemVariants}>
          <AlignmentWidget />
        </motion.section>

        {/* Insights */}
        <motion.section variants={itemVariants}>
          <InsightsCard />
        </motion.section>

        {/* Daily Scripture */}
        <motion.section variants={itemVariants}>
          <div className="scripture-card">
            <p className="text-[17px] italic leading-relaxed mb-5" style={{ color: 'var(--text-primary)', fontWeight: 400 }}>
              "{dailyScripture.verse}"
            </p>
            <p className="text-[11px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
              {dailyScripture.reference}
            </p>
          </div>
        </motion.section>

        {/* Quick Access Grid */}
        <motion.section variants={itemVariants}>
          <h2 className="text-[15px] font-semibold uppercase mb-3 px-1" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
            Quick Access
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/today')}
              className="home-card text-left"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(212, 168, 67, 0.15)' }}>
                <svg className="w-5 h-5" style={{ color: '#D4A843' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Today</p>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Track disciplines</p>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/week')}
              className="home-card text-left"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(107, 141, 227, 0.15)' }}>
                <svg className="w-5 h-5" style={{ color: '#6B8DE3' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly</p>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>View progress</p>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/calendar')}
              className="home-card text-left"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(91, 185, 139, 0.15)' }}>
                <svg className="w-5 h-5" style={{ color: '#5BB98B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Calendar</p>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Events & milestones</p>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/fasting')}
              className="home-card text-left"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(176, 126, 224, 0.15)' }}>
                <svg className="w-5 h-5" style={{ color: '#B07EE0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Fasting</p>
              <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Track fasts</p>
            </motion.button>
          </div>
        </motion.section>

        <div className="h-4" />
      </motion.div>
    </PageWrapper>
  )
}

export default Dashboard
