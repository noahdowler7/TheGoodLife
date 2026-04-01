import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../services/api'

function AlignmentWidget() {
  const [alignment, setAlignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAlignment()
  }, [])

  const fetchAlignment = async () => {
    try {
      setLoading(true)
      const data = await api.get('/api/v1/analytics/trends')
      setAlignment(data.alignment)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch alignment:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Don't render if error (offline/unauthenticated)
  if (error || !alignment) return null
  if (loading) return null

  const score = alignment.score || 0
  const interpretation = alignment.interpretation || ''
  const period = alignment.period_days || 7

  // Color based on score range
  const getColor = () => {
    if (score >= 80) return '#5BB98B' // green
    if (score >= 60) return '#D4A843' // yellow/gold
    if (score >= 40) return '#E07B6A' // orange/red
    return '#E07B6A' // red
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

      {/* Circular Progress */}
      <div className="relative inline-flex items-center justify-center mb-4">
        <svg width="160" height="160" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="var(--bg-tertiary)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[36px] font-bold" style={{ color }}>
            {Math.round(score)}
          </span>
          <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            out of 100
          </span>
        </div>
      </div>

      {/* Interpretation */}
      <p className="text-[14px] leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
        {interpretation}
      </p>
      <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
        Last {period} days
      </p>
    </motion.div>
  )
}

export default AlignmentWidget
