import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper from './PageWrapper'
import { CAPITALS } from '../utils/capitals'
import { dataService } from '../services/dataService'

function PartnerSummary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPartnerSummary()
  }, [id])

  const loadPartnerSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dataService.getPartnerSummary(id)
      setSummary(data)
    } catch (err) {
      console.error('Failed to load partner summary:', err)
      setError(err.message || 'Failed to load partner summary')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
        </div>
      </PageWrapper>
    )
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-[15px] mb-4" style={{ color: 'var(--danger)' }}>{error}</p>
          <button
            onClick={() => navigate('/settings')}
            className="btn-primary"
          >
            Back to Settings
          </button>
        </div>
      </PageWrapper>
    )
  }

  if (!summary) return null

  return (
    <PageWrapper>
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10" style={{ background: 'var(--bg-primary)' }}>
          <button onClick={() => navigate('/settings')}>
            <svg className="w-6 h-6" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-[20px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {summary.partner_name}
          </h1>
        </div>

        {/* Alignment Score Circle */}
        <div className="px-5 py-6 flex flex-col items-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="var(--bg-tertiary)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="var(--accent)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(summary.alignment_score || 0) * 3.52} 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[32px] font-bold" style={{ color: 'var(--accent)' }}>
                {summary.alignment_score || 0}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                Alignment
              </span>
            </div>
          </div>
          <p className="text-[13px] mt-4 text-center max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            Average investment score across all capitals
          </p>
        </div>

        {/* Streak */}
        <div className="px-5 mb-6">
          <div className="card-surface rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <svg className="w-6 h-6" style={{ color: '#0A0A0A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>
                {summary.current_streak} Days
              </p>
              <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                Current Streak
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Completion by Capital */}
        <div className="px-5 mb-6">
          <p className="text-[11px] font-semibold tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
            WEEKLY COMPLETION
          </p>
          <div className="card-surface rounded-2xl p-4 space-y-4">
            {summary.active_capitals.map(capitalId => {
              const capital = CAPITALS[capitalId]
              const completion = summary.weekly_completion[capitalId] || 0
              return (
                <div key={capitalId}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: capital.color }} />
                      <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        {capital.name}
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: capital.color }}>
                      {completion}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        background: capital.color,
                        width: `${completion}%`
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Ratings */}
        <div className="px-5 mb-6">
          <p className="text-[11px] font-semibold tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
            RECENT RATINGS (LAST 7 DAYS)
          </p>
          <div className="card-surface rounded-2xl p-4">
            {summary.recent_ratings.length === 0 ? (
              <p className="text-[14px] text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
                No recent ratings
              </p>
            ) : (
              <div className="space-y-3">
                {/* Group by date */}
                {Object.entries(
                  summary.recent_ratings.reduce((acc, rating) => {
                    if (!acc[rating.date]) acc[rating.date] = []
                    acc[rating.date].push(rating)
                    return acc
                  }, {})
                ).map(([date, ratings]) => (
                  <div key={date}>
                    <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <div className="flex gap-2">
                      {ratings.map((rating, idx) => {
                        const capital = CAPITALS[rating.capital_id]
                        return (
                          <div
                            key={idx}
                            className="flex-1 rounded-lg p-2 flex flex-col items-center"
                            style={{ background: `${capital.color}15` }}
                          >
                            <div className="w-4 h-4 rounded-full mb-1" style={{ background: capital.color }} />
                            <span className="text-[13px] font-bold" style={{ color: capital.color }}>
                              {rating.score}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default PartnerSummary
