import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../services/api'

function InsightsCard() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const data = await api.get('/api/v1/analytics/trends')
      setInsights(data.insights || [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch insights:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Don't render if error (offline/unauthenticated) or no insights
  if (error) return null
  if (loading) return null
  if (!insights || insights.length === 0) return null

  // Determine icon and style based on insight type/severity
  const getInsightStyle = (insight) => {
    const message = insight.message || insight.text || ''
    const lowerMessage = message.toLowerCase()

    // Priority inversion warnings
    if (lowerMessage.includes('inversion') || lowerMessage.includes('priority') || insight.severity === 'warning') {
      return {
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        bgColor: 'rgba(224, 123, 106, 0.15)',
        iconColor: '#E07B6A',
        textColor: 'var(--text-primary)'
      }
    }

    // Info/general insights (like "No reflections")
    return {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'rgba(107, 141, 227, 0.15)',
      iconColor: '#6B8DE3',
      textColor: 'var(--text-primary)'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-[15px] font-semibold uppercase mb-3 px-1" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
        Insights
      </h3>
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const style = getInsightStyle(insight)
          const message = insight.message || insight.text || 'Insight'

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: style.bgColor, color: style.iconColor }}
              >
                {style.icon}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-[14px] leading-relaxed" style={{ color: style.textColor }}>
                  {message}
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
