import { useState } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

const PROMPTS = [
  ["A person I'm thankful for...", "Something God provided...", "A moment that made me smile..."],
  ["A blessing I don't deserve...", "Someone who showed me love...", "Something beautiful I noticed..."],
  ["A prayer God answered...", "A skill or ability I have...", "A challenge that grew me..."],
  ["Something in creation...", "A relationship I value...", "A comfort I take for granted..."],
  ["A verse that encouraged me...", "An opportunity I was given...", "Something about God I experienced..."],
  ["A meal I enjoyed...", "A conversation that mattered...", "A way God protected me..."],
  ["Something that made me laugh...", "A mentor in my life...", "A freedom I have..."],
]

export default function GratitudeJournal({ reflections, setReflections }) {
  const [expanded, setExpanded] = useState(false)
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const gratitude = reflections[todayStr]?.gratitude || ['', '', '']
  const filledCount = gratitude.filter(g => g.trim()).length
  const dayPrompts = PROMPTS[new Date().getDay()]

  const handleChange = (index, text) => {
    const updated = [...gratitude]
    updated[index] = text
    setReflections(prev => ({
      ...prev,
      [todayStr]: { ...(prev[todayStr] || {}), gratitude: updated },
    }))
  }

  return (
    <motion.div
      className="rounded-2xl overflow-visible"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(91, 185, 139, 0.15)' }}>
          <svg className="w-5 h-5" style={{ color: '#5BB98B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Grateful Today</p>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {filledCount === 0 ? 'What are you thankful for?' : `${filledCount}/3 gratitudes`}
          </p>
        </div>
        {filledCount === 3 && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#5BB98B' }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        <svg
          className="w-4 h-4 transition-transform"
          style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-2 text-[12px] font-bold"
                style={{
                  background: gratitude[i]?.trim() ? '#5BB98B' : 'var(--bg-tertiary)',
                  color: gratitude[i]?.trim() ? 'white' : 'var(--text-muted)',
                }}
              >
                {i + 1}
              </span>
              <input
                type="text"
                value={gratitude[i] || ''}
                onChange={(e) => handleChange(i, e.target.value)}
                placeholder={dayPrompts[i]}
                className="flex-1 px-3 py-2.5 rounded-xl text-[14px] outline-none"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              />
            </div>
          ))}
          {filledCount === 3 && (
            <p className="text-[13px] text-center pt-2 italic" style={{ color: '#5BB98B' }}>
              Grateful heart, grateful life.
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}
