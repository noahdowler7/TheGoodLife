import { useState } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  {
    id: 'presence',
    title: "God's Presence",
    prompt: 'Become aware that you are in God\'s presence right now. Take a deep breath. He is with you.',
    type: 'pause',
  },
  {
    id: 'gratitude',
    title: 'Gratitude',
    prompt: 'What am I most grateful for today?',
    placeholder: "Today I'm grateful for...",
    type: 'text',
  },
  {
    id: 'review',
    title: 'Review the Day',
    prompt: 'Where did I feel closest to God today? Where did I feel furthest?',
    placeholder: 'I felt close to God when... I felt distant when...',
    type: 'text',
  },
  {
    id: 'sorrow',
    title: 'Sorrow & Confession',
    prompt: 'Is there anything I need to confess or release? Any moment I wish I could redo?',
    placeholder: 'Lord, I confess...',
    type: 'text',
  },
  {
    id: 'tomorrow',
    title: 'Looking Forward',
    prompt: 'What is God inviting me into tomorrow? What do I need from him?',
    placeholder: 'Tomorrow, I ask for...',
    type: 'text',
  },
]

export default function DailyExamen({ reflections, setReflections }) {
  const [expanded, setExpanded] = useState(false)
  const [step, setStep] = useState(0)
  const [breathCount, setBreathCount] = useState(0)
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const examenData = reflections[todayStr]?.examen || {}
  const isComplete = examenData.completed

  const handleChange = (stepId, text) => {
    setReflections(prev => ({
      ...prev,
      [todayStr]: {
        ...(prev[todayStr] || {}),
        examen: { ...(prev[todayStr]?.examen || {}), [stepId]: text },
      },
    }))
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      // Complete
      setReflections(prev => ({
        ...prev,
        [todayStr]: {
          ...(prev[todayStr] || {}),
          examen: { ...(prev[todayStr]?.examen || {}), completed: true },
        },
      }))
      setStep(0)
      setExpanded(false)
    }
  }

  const currentStep = STEPS[step]

  return (
    <motion.div
      className="rounded-3xl overflow-visible"
      style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
    >
      <button
        onClick={() => { setExpanded(!expanded); if (!expanded) setStep(0) }}
        className="w-full p-5 flex items-center gap-4 text-left"
      >
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(212, 168, 67, 0.15)' }}>
          <svg className="w-5 h-5" style={{ color: '#D4A843' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Evening Examen</p>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {isComplete ? 'Completed tonight' : 'Review your day with God'}
          </p>
        </div>
        {isComplete && (
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

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="px-5 pb-5">
              {/* Step dots */}
              <div className="flex justify-center gap-2 mb-5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{ background: i === step ? '#D4A843' : i < step ? '#5BB98B' : 'var(--bg-tertiary)', transform: i === step ? 'scale(1.3)' : 'scale(1)' }}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#D4A843' }}>
                    {currentStep.title}
                  </p>
                  <p className="text-[15px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {currentStep.prompt}
                  </p>

                  {currentStep.type === 'pause' ? (
                    <div className="flex flex-col items-center py-6">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-20 h-20 rounded-full mb-4"
                        style={{ background: 'rgba(212, 168, 67, 0.15)', border: '2px solid rgba(212, 168, 67, 0.3)' }}
                      />
                      <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Breathe and be still</p>
                    </div>
                  ) : (
                    <textarea
                      value={examenData[currentStep.id] || ''}
                      onChange={(e) => handleChange(currentStep.id, e.target.value)}
                      placeholder={currentStep.placeholder}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl text-[14px] outline-none resize-none leading-relaxed mb-2"
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid rgba(212, 168, 67, 0.2)' }}
                      ref={(el) => {
                        if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200)
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl text-[14px] font-semibold mt-2"
                style={{ background: '#D4A843', color: '#0A0A0A' }}
              >
                {step === STEPS.length - 1 ? 'Amen. Rest well tonight.' : 'Next'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
