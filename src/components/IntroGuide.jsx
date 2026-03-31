import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDES = [
  {
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'Five Capitals',
    description: 'Spiritual, Relational, Physical, Intellectual, Financial — invest in what matters most as you become who God made you to be.',
  },
  {
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'Daily Rhythms',
    description: 'Build spiritual rhythms each day. Rate your growth, journal your heart, and develop holy habits.',
  },
  {
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'Your Journey',
    description: 'Track your growth over time. See weekly trends, celebrate streaks, and stay encouraged on your path.',
  },
]

function IntroGuide({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  const slide = SLIDES[currentSlide]
  const isLastSlide = currentSlide === SLIDES.length - 1

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <button
          onClick={onComplete}
          className="px-4 py-2 text-[15px] font-medium rounded-xl"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              {slide.icon}
            </motion.div>
            <h1 className="text-[28px] font-semibold mb-4" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
              {slide.title}
            </h1>
            <p className="text-[17px] leading-relaxed max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-8">
        <div className="flex justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="h-2 rounded-full transition-all"
              style={{
                background: currentSlide >= i ? 'var(--accent)' : 'var(--bg-tertiary)',
                width: currentSlide === i ? 24 : 8,
              }}
            />
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="btn-primary w-full"
        >
          {isLastSlide ? "Let's Go" : 'Continue'}
        </motion.button>
      </div>
    </div>
  )
}

export default IntroGuide
