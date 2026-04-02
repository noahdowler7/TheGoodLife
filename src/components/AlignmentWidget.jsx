import { useState, useEffect, useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import { CAPITAL_ORDER, getDisciplinesForCapital } from '../utils/capitals'

function calculateLocalAlignment(days = 7) {
  try {
    const disciplines = JSON.parse(localStorage.getItem('thegoodlife_disciplines') || '{}')
    const ratings = JSON.parse(localStorage.getItem('thegoodlife_ratings') || '{}')
    const settings = JSON.parse(localStorage.getItem('thegoodlife_settings') || '{}')
    const capitalToggles = settings.capitals || {}

    const today = new Date()
    let totalPossible = 0
    let totalCompleted = 0
    let ratingSum = 0
    let ratingCount = 0

    for (let i = 0; i < days; i++) {
      const dateStr = format(subDays(today, i), 'yyyy-MM-dd')
      const dayData = disciplines[dateStr] || {}
      const dayRatings = ratings[dateStr] || {}

      CAPITAL_ORDER.forEach(capitalId => {
        if (capitalToggles[capitalId] === false) return
        const discs = getDisciplinesForCapital(capitalId)
        discs.forEach(d => {
          totalPossible++
          if (dayData[d.id]) totalCompleted++
        })
        if (dayRatings[capitalId] > 0) {
          ratingSum += dayRatings[capitalId]
          ratingCount++
        }
      })
    }

    const completionScore = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0
    const ratingScore = ratingCount > 0 ? (ratingSum / ratingCount / 5) * 100 : 0
    const score = ratingCount > 0
      ? Math.round(completionScore * 0.6 + ratingScore * 0.4)
      : Math.round(completionScore)

    let interpretation = ''
    if (score >= 80) interpretation = 'Your life is deeply aligned across all capitals. Keep investing.'
    else if (score >= 60) interpretation = 'Good momentum. A few more consistent days will strengthen your rhythm.'
    else if (score >= 30) interpretation = 'You are building. Small, faithful steps compound over time.'
    else if (score > 0) interpretation = 'Every journey starts with one step. You showed up — that matters.'
    else interpretation = 'Start tracking your daily rhythms to see your alignment grow.'

    return { score, interpretation, period_days: days }
  } catch {
    return null
  }
}

function AlignmentWidget() {
  const [alignment, setAlignment] = useState(null)

  useEffect(() => {
    // Try API first, fall back to local calculation
    api.get('/api/v1/analytics/trends')
      .then(data => setAlignment(data.alignment))
      .catch(() => setAlignment(calculateLocalAlignment()))
  }, [])

  if (!alignment || alignment.score === undefined) return null

  const score = alignment.score || 0
  const interpretation = alignment.interpretation || ''
  const period = alignment.period_days || 7

  const getColor = () => {
    if (score >= 80) return '#5BB98B'
    if (score >= 60) return '#D4A843'
    if (score >= 40) return '#E07B6A'
    return '#E07B6A'
  }

  const color = getColor()
  const radius = 55
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl p-6 text-center"
      style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
    >
      <h3 className="text-[15px] font-semibold uppercase mb-4" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
        Alignment Score
      </h3>

      <div className="relative inline-flex items-center justify-center mb-4">
        <svg width="160" height="160" className="transform -rotate-90">
          <circle cx="80" cy="80" r={radius} stroke="var(--bg-tertiary)" strokeWidth="8" fill="none" />
          <circle
            cx="80" cy="80" r={radius} stroke={color} strokeWidth="8" fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[36px] font-bold" style={{ color }}>{Math.round(score)}</span>
          <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>out of 100</span>
        </div>
      </div>

      <p className="text-[14px] leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
        {interpretation}
      </p>
      <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Last {period} days</p>
    </motion.div>
  )
}

export default AlignmentWidget
