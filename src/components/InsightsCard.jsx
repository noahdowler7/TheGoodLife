import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import { CAPITALS, CAPITAL_ORDER, getDisciplinesForCapital } from '../utils/capitals'

function generateLocalInsights() {
  try {
    const disciplines = JSON.parse(localStorage.getItem('thegoodlife_disciplines') || '{}')
    const ratings = JSON.parse(localStorage.getItem('thegoodlife_ratings') || '{}')
    const reflections = JSON.parse(localStorage.getItem('thegoodlife_reflections') || '{}')
    const settings = JSON.parse(localStorage.getItem('thegoodlife_settings') || '{}')
    const capitalToggles = settings.capitals || {}

    const insights = []
    const today = new Date()
    const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(today, i), 'yyyy-MM-dd'))

    // Per-capital completion rates
    const capitalRates = {}
    CAPITAL_ORDER.forEach(capitalId => {
      if (capitalToggles[capitalId] === false) return
      const discs = getDisciplinesForCapital(capitalId)
      let done = 0, total = 0
      last7.forEach(d => {
        const dayData = disciplines[d] || {}
        discs.forEach(disc => { total++; if (dayData[disc.id]) done++ })
      })
      capitalRates[capitalId] = total > 0 ? done / total : 0
    })

    // Find strongest and weakest capital
    const sorted = Object.entries(capitalRates).sort((a, b) => b[1] - a[1])
    if (sorted.length >= 2 && sorted[0][1] > 0) {
      const strongest = CAPITALS[sorted[0][0]]
      insights.push({ message: `${strongest.name} Capital is your strongest rhythm this week. Keep investing there.`, severity: 'info' })
    }
    if (sorted.length >= 2 && sorted[sorted.length - 1][1] < sorted[0][1] * 0.5 && sorted[0][1] > 0.3) {
      const weakest = CAPITALS[sorted[sorted.length - 1][0]]
      insights.push({ message: `${weakest.name} Capital could use more attention. Even one small step helps.`, severity: 'warning' })
    }

    // Priority inversion: check if lower-priority capitals are higher than spiritual
    if (capitalRates.spiritual !== undefined && capitalRates.spiritual < 0.3) {
      const higherLower = Object.entries(capitalRates).find(
        ([id, rate]) => id !== 'spiritual' && rate > capitalRates.spiritual + 0.3
      )
      if (higherLower) {
        insights.push({ message: `Your Spiritual rhythms are low while ${CAPITALS[higherLower[0]].name} is strong. Consider re-aligning your priorities.`, severity: 'warning' })
      }
    }

    // No reflections this week
    const hasReflection = last7.some(d => {
      const dayRef = reflections[d]
      return dayRef && Object.values(dayRef).some(v => v && v.trim())
    })
    if (!hasReflection && sorted.some(([, r]) => r > 0)) {
      insights.push({ message: 'Try adding a reflection this week. Writing helps you hear what God is saying.', severity: 'info' })
    }

    // Streak encouragement
    const todayStr = format(today, 'yyyy-MM-dd')
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd')
    if (disciplines[todayStr] && disciplines[yesterdayStr]) {
      const todayCount = Object.values(disciplines[todayStr]).filter(Boolean).length
      const yesterdayCount = Object.values(disciplines[yesterdayStr]).filter(Boolean).length
      if (todayCount > 0 && yesterdayCount > 0) {
        insights.push({ message: 'Two days in a row — your consistency is building. Keep showing up.', severity: 'info' })
      }
    }

    return insights.slice(0, 3)
  } catch {
    return []
  }
}

function InsightsCard() {
  const [insights, setInsights] = useState([])

  useEffect(() => {
    // Try API first, fall back to local generation
    api.get('/api/v1/analytics/trends')
      .then(data => setInsights(data.insights || []))
      .catch(() => setInsights(generateLocalInsights()))
  }, [])

  if (!insights || insights.length === 0) return null

  const getInsightStyle = (insight) => {
    if (insight.severity === 'warning') {
      return {
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        bgColor: 'rgba(224, 123, 106, 0.15)',
        iconColor: '#E07B6A',
      }
    }
    return {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'rgba(107, 141, 227, 0.15)',
      iconColor: '#6B8DE3',
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h3 className="text-[15px] font-semibold uppercase mb-3 px-1" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
        Insights
      </h3>
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const style = getInsightStyle(insight)
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: style.bgColor, color: style.iconColor }}>
                {style.icon}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {insight.message || insight.text}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default InsightsCard
