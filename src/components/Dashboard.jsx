import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import PageWrapper from './PageWrapper'
import CapitalCard from './CapitalCard'
import StreakIndicator from './StreakIndicator'
import InsightsCard from './InsightsCard'
import AlignmentWidget from './AlignmentWidget'
import { getDailyScripture } from '../utils/scriptures'
import { getDailyExposition, getDailyReading } from '../utils/devotional'
import ThreePillars from './ThreePillars'
import ScriptureMemory from './ScriptureMemory'
import GratitudeJournal from './GratitudeJournal'
import { CAPITALS, CAPITAL_ORDER } from '../utils/capitals'
import { getLiturgicalSeason } from '../utils/liturgicalCalendar'
import { calculateCapitalScore, getActiveStreaks, getDailyCompletionRate } from '../utils/streaks'
import { ALL_DISCIPLINES } from '../utils/capitals'
import { getChapter, savePosition, parseScriptureRef } from '../utils/bible'
import SilenceTimer from './SilenceTimer'

function Dashboard({ disciplines, setDisciplines, ratings, reflections, setReflections, settings, customDisciplines }) {
  const navigate = useNavigate()
  const today = new Date()
  const hour = today.getHours()
  const todayStr = format(today, 'yyyy-MM-dd')
  const capitalToggles = settings?.capitals || {}

  const openScripture = (reference) => {
    const parsed = parseScriptureRef(reference)
    if (parsed) {
      savePosition(parsed.bookId, parsed.chapter)
      navigate('/devotional?tab=bible')
    }
  }

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

  // Devotional preview for dashboard
  const capitalId = dailyScripture.capital || 'spiritual'
  const dailyExposition = useMemo(() => getDailyExposition(today)(capitalId), [todayStr, capitalId])
  const dailyReading = useMemo(() => getDailyReading(today)(capitalId), [todayStr, capitalId])

  // Daily Psalm (150 psalms, rotate by day of year)
  const [dailyPsalm, setDailyPsalm] = useState(null)
  const psalmNumber = useMemo(() => {
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)
    return (dayOfYear % 150) + 1
  }, [todayStr])

  useEffect(() => {
    getChapter('psa', psalmNumber)
      .then(data => {
        const preview = data.verses.slice(0, 3).map(v => v.text).join(' ')
        setDailyPsalm({ number: psalmNumber, preview })
      })
      .catch(() => {})
  }, [psalmNumber])

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
        {/* Liturgical Season Banner */}
        {dailyScripture.liturgicalDay && (
          <motion.section variants={itemVariants}>
            <div className="rounded-2xl px-4 py-3" style={{
              background: `${dailyScripture.liturgicalDay.color}15`,
              borderLeft: `3px solid ${dailyScripture.liturgicalDay.color}`,
            }}>
              <p className="text-[11px] tracking-widest uppercase font-semibold" style={{ color: dailyScripture.liturgicalDay.color }}>
                {getLiturgicalSeason(today).name}
              </p>
              <p className="text-[16px] font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {dailyScripture.liturgicalDay.name}
              </p>
            </div>
          </motion.section>
        )}

        {/* Daily Scripture — Hero Position */}
        <motion.section variants={itemVariants}>
          <div className="scripture-card">
            <p className="text-[11px] tracking-widest uppercase mb-4" style={{ color: dailyScripture.liturgicalDay?.color || 'var(--accent)' }}>
              {dailyScripture.liturgicalDay ? `${dailyScripture.liturgicalDay.name} Scripture` : "Today's Scripture"}
            </p>
            <p className="text-[19px] italic leading-relaxed mb-5" style={{ color: 'var(--text-primary)', fontWeight: 400 }}>
              "{dailyScripture.verse}"
            </p>
            <button
              onClick={() => openScripture(dailyScripture.reference)}
              className="text-[11px] tracking-widest uppercase flex items-center gap-1 mx-auto"
              style={{ color: 'var(--accent)' }}
            >
              {dailyScripture.reference}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </motion.section>

        {/* Today's Devotional Preview */}
        <motion.section variants={itemVariants}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/devotional')}
            className="w-full rounded-3xl p-5 text-left"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(212, 168, 67, 0.15)' }}>
                <svg className="w-5 h-5" style={{ color: '#D4A843' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Today's Reading</p>
                <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{dailyReading?.title || 'Daily Devotional'}</p>
              </div>
            </div>
            <p className="text-[14px] leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
              {dailyExposition ? dailyExposition.slice(0, 150) + '...' : 'Open today\'s devotional for scripture, exposition, and reflection.'}
            </p>
            <p className="text-[13px] font-medium mt-3" style={{ color: '#D4A843' }}>
              Continue Reading →
            </p>
          </motion.button>
        </motion.section>

        {/* Daily Psalm */}
        {dailyPsalm && (
          <motion.section variants={itemVariants}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                savePosition('psa', psalmNumber)
                navigate('/devotional?tab=bible')
              }}
              className="w-full rounded-2xl p-4 text-left"
              style={{ background: 'rgba(91, 185, 139, 0.08)', border: '1px solid rgba(91, 185, 139, 0.2)' }}
            >
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: '#5BB98B' }}>
                Daily Psalm
              </p>
              <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Psalm {dailyPsalm.number}
              </p>
              <p className="text-[13px] italic leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {dailyPsalm.preview}
              </p>
              <p className="text-[12px] font-medium mt-2" style={{ color: '#5BB98B' }}>
                Read full psalm →
              </p>
            </motion.button>
          </motion.section>
        )}

        {/* Scripture Memory */}
        <motion.section variants={itemVariants}>
          <ScriptureMemory />
        </motion.section>

        {/* Gratitude Journal */}
        <motion.section variants={itemVariants}>
          <GratitudeJournal reflections={reflections} setReflections={setReflections} />
        </motion.section>

        {/* Five Capital Progress Rings */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[15px] font-semibold uppercase" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
              Five Capitals
            </h2>
            {overallCompletion > 0 && (
              <span className="text-[13px] font-medium" style={{ color: 'var(--accent)' }}>
                {Math.round(overallCompletion * 100)}% today
              </span>
            )}
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

        {/* Three Pillars Check-in */}
        <motion.section variants={itemVariants}>
          <ThreePillars reflections={reflections} setReflections={setReflections} />
        </motion.section>

        {/* Silence & Solitude */}
        <motion.section variants={itemVariants}>
          <SilenceTimer reflections={reflections} setReflections={setReflections} setDisciplines={setDisciplines} />
        </motion.section>

        {/* Alignment Score */}
        <motion.section variants={itemVariants}>
          <AlignmentWidget />
        </motion.section>

        {/* Insights */}
        <motion.section variants={itemVariants}>
          <InsightsCard />
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
