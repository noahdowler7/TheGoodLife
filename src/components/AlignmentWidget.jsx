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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}
      >
        <span className="text-[22px] font-bold" style={{ color }}>{Math.round(score)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Alignment Score
        </p>
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {interpretation}
        </p>
      </div>
      <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>{period}d</span>
    </motion.div>
  )
}

export default AlignmentWidget
