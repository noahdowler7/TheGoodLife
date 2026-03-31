import { useState, useMemo } from 'react'
import { format, startOfWeek, addDays } from 'date-fns'
import { motion } from 'framer-motion'
import PageWrapper from './PageWrapper'
import { CAPITALS, CAPITAL_ORDER } from '../utils/capitals'
import { calculateCapitalScore, getWeeklyCompletionRate } from '../utils/streaks'

function WeeklyProgress({ disciplines, ratings, settings, customDisciplines }) {
  const [tab, setTab] = useState('overview')
  const capitalToggles = settings?.capitals || {}
  const activeCapitals = CAPITAL_ORDER.filter(id => capitalToggles[id] !== false)

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: settings?.startOfWeek || 0 })
  const weekDates = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'))

  // Weekly rates per capital
  const weeklyRates = useMemo(() => {
    return activeCapitals.map(id => ({
      id,
      rate: getWeeklyCompletionRate(id, disciplines, weekDates, customDisciplines),
    }))
  }, [disciplines, weekDates, activeCapitals, customDisciplines])

  // Daily breakdown
  const dailyBreakdown = useMemo(() => {
    return weekDates.map(dateStr => {
      const scores = activeCapitals.map(capitalId => ({
        capitalId,
        ...calculateCapitalScore(capitalId, disciplines, ratings, dateStr, customDisciplines),
      }))
      return { dateStr, scores }
    })
  }, [disciplines, ratings, weekDates, activeCapitals, customDisciplines])

  // Average ratings per capital this week
  const avgRatings = useMemo(() => {
    return activeCapitals.map(capitalId => {
      const ratingValues = weekDates
        .map(d => ratings[d]?.[capitalId])
        .filter(r => r && r > 0)
      const avg = ratingValues.length > 0
        ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
        : 0
      return { capitalId, avg }
    })
  }, [ratings, weekDates, activeCapitals])

  return (
    <PageWrapper className="min-h-screen pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-[28px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Weekly Progress
        </h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </p>
      </header>

      {/* Tab Control */}
      <div className="px-5 mb-5">
        <div className="segmented-control">
          <button
            className={`segment ${tab === 'overview' ? 'active' : ''}`}
            onClick={() => setTab('overview')}
          >
            Overview
          </button>
          <button
            className={`segment ${tab === 'trends' ? 'active' : ''}`}
            onClick={() => setTab('trends')}
          >
            Trends
          </button>
        </div>
      </div>

      <div className="px-5 space-y-5">
        {tab === 'overview' ? (
          /* Day-by-day overview */
          dailyBreakdown.map(({ dateStr, scores }) => {
            const date = new Date(dateStr + 'T12:00:00')
            const isToday = dateStr === format(today, 'yyyy-MM-dd')
            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4"
                style={{
                  background: 'var(--bg-card)',
                  border: isToday ? '2px solid var(--accent)' : '1px solid var(--border)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {format(date, 'EEEE')}
                    </span>
                    {isToday && (
                      <span className="ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                    {format(date, 'MMM d')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {scores.map(s => {
                    const capital = CAPITALS[s.capitalId]
                    const pct = Math.round(s.completionRate * 100)
                    return (
                      <div key={s.capitalId} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full h-2 rounded-full overflow-hidden"
                          style={{ background: 'var(--bg-tertiary)' }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: capital.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="w-3 h-3 rounded-full" style={{ background: capital.color, opacity: pct > 0 ? 1 : 0.3 }} />
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })
        ) : (
          /* Trends tab */
          <>
            {/* Per-capital weekly bars */}
            <div className="space-y-4">
              {weeklyRates.map(({ id, rate }) => {
                const capital = CAPITALS[id]
                const pct = Math.round(rate * 100)
                return (
                  <div key={id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: capital.color }} />
                        <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                          {capital.name}
                        </span>
                      </div>
                      <span className="text-[14px] font-semibold" style={{ color: capital.color }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: capital.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Average Ratings */}
            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Average Ratings
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {avgRatings.map(({ capitalId, avg }) => {
                  const capital = CAPITALS[capitalId]
                  return (
                    <div
                      key={capitalId}
                      className="rounded-2xl p-4 text-center"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <p className="text-[24px] font-semibold" style={{ color: capital.color }}>
                        {avg > 0 ? avg.toFixed(1) : '-'}
                      </p>
                      <p className="text-[12px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        {capital.name}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <div className="h-4" />
      </div>
    </PageWrapper>
  )
}

export default WeeklyProgress
