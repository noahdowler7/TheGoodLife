import { motion } from 'framer-motion'
import { CAPITALS } from '../utils/capitals'

function ProgressRing({ progress, color, size = 56, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--bg-tertiary)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  )
}

function CapitalCard({ capitalId, completionRate, rating, compact = false }) {
  const capital = CAPITALS[capitalId]
  if (!capital) return null

  const percentage = Math.round(completionRate * 100)

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 min-w-[72px]">
        <div className="relative">
          <ProgressRing progress={completionRate} color={capital.color} size={48} strokeWidth={3} />
          <span
            className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold"
            style={{ color: capital.color }}
          >
            {percentage}%
          </span>
        </div>
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {capital.name}
        </span>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="relative">
        <ProgressRing progress={completionRate} color={capital.color} />
        <span
          className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold"
          style={{ color: capital.color }}
        >
          {percentage}%
        </span>
      </div>
      <div className="flex-1">
        <p className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {capital.name}
        </p>
        {rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: i <= rating ? capital.color : 'var(--bg-tertiary)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { ProgressRing }
export default CapitalCard
