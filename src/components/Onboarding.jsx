import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { compressImage } from '../utils/imageUtils'
import { CAPITALS, CAPITAL_ORDER } from '../utils/capitals'
import MovementLogo from './MovementLogo'

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [theme, setTheme] = useState('dark')
  const [capitals, setCapitals] = useState({
    spiritual: true,
    relational: true,
    physical: true,
    intellectual: true,
    financial: true,
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [expandedCapital, setExpandedCapital] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    try {
      const compressed = await compressImage(file, { maxSize: 200, quality: 0.8 })
      setProfilePicture(compressed)
    } catch {
      const reader = new FileReader()
      reader.onloadend = () => setProfilePicture(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleComplete = () => {
    onComplete({
      name: name.trim() || null,
      capitals,
      theme,
      profilePicture: profilePicture || null,
    })
  }

  const handleThemeSelect = (selectedTheme) => {
    setTheme(selectedTheme)
    // Apply theme immediately
    document.documentElement.setAttribute('data-theme', selectedTheme)
  }

  const toggleCapital = (id) => {
    setCapitals(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <AnimatePresence mode="wait">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <motion.div
            key="welcome"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex-1 flex flex-col px-8 text-center"
          >
            {/* Logo — small, pinned to top */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="pt-14 pb-2 flex justify-center"
            >
              <MovementLogo width={160} />
            </motion.div>

            {/* Main hero — "The Good Life" */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-[56px] leading-none font-semibold mb-5"
                style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}
              >
                The Good Life
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-[17px] leading-relaxed max-w-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                Know God. Find Freedom. Discover Purpose. Make a Difference.
              </motion.p>
            </div>

            {/* Button — pinned to bottom */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="pb-14"
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                className="btn-primary w-full max-w-xs"
              >
                Get Started
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <motion.div
            key="name"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex-1 flex flex-col min-h-0 px-6 pt-16 pb-4"
          >
            <div className="flex-shrink-0 text-center mb-8">
              <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
                What's your name?
              </h1>
              <p className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>
                For personalized greetings
              </p>
            </div>
            <div className="flex-1 flex flex-col justify-center min-h-0">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="input-field text-center text-[18px] mb-6"
              />
            </div>
            <div className="flex-shrink-0 space-y-3">
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep(2)} className="btn-primary w-full">
                Continue
              </motion.button>
              <button onClick={() => setStep(0)} className="w-full py-3 text-[15px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Go back
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Five Capitals */}
        {step === 2 && (
          <motion.div
            key="capitals"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex-1 flex flex-col min-h-0 px-6 pt-12 pb-4"
          >
            <div className="text-center mb-4 flex-shrink-0">
              <h1 className="text-[28px] font-semibold mb-1" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
                Your Five Capitals
              </h1>
              <p className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>
                Choose where God is calling you to grow. Tap to learn more.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 space-y-3 mb-4">
              <div className="space-y-3">
              {CAPITAL_ORDER.map(id => {
                const capital = CAPITALS[id]
                const enabled = capitals[id]
                const isExpanded = expandedCapital === id
                return (
                  <motion.div
                    key={id}
                    className="w-full rounded-2xl p-4 transition-all"
                    style={{
                      background: enabled ? `${capital.color}15` : 'var(--bg-card)',
                      border: `2px solid ${enabled ? capital.color : 'var(--border)'}`,
                    }}
                  >
                    {/* Card Header - clickable to expand */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: enabled ? capital.color : 'var(--bg-tertiary)' }}>
                        <div className="w-4 h-4 rounded-full" style={{ background: enabled ? 'white' : 'var(--text-muted)' }} />
                      </div>
                      <button
                        onClick={() => setExpandedCapital(isExpanded ? null : id)}
                        className="flex-1 text-left"
                      >
                        <p className="text-[16px] font-medium mb-1" style={{ color: enabled ? capital.color : 'var(--text-primary)' }}>
                          {capital.name}
                        </p>
                        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                          {capital.description}
                        </p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleCapital(id)
                        }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${enabled ? '' : 'border-2'}`}
                        style={enabled ? { background: capital.color } : { borderColor: 'var(--text-muted)' }}
                      >
                        {enabled && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => setExpandedCapital(isExpanded ? null : id)}
                        className="flex-shrink-0 transition-transform"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        <svg className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                            <div>
                              <p className="text-[12px] font-semibold mb-2" style={{ color: capital.color }}>
                                Why It Matters
                              </p>
                              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {capital.whyItMatters}
                              </p>
                            </div>
                            <div className="bg-surface rounded-xl p-3">
                              <p className="text-[12px] italic leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                                {capital.verse}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
              </div>
            </div>
            <div className="flex-shrink-0 space-y-3">
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep(3)} className="btn-primary w-full">
                Continue
              </motion.button>
              <button onClick={() => setStep(1)} className="w-full py-3 text-[15px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Go back
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Theme Selection */}
        {step === 3 && (
          <motion.div
            key="theme"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex-1 flex flex-col min-h-0 px-6 pt-12 pb-4"
          >
            <div className="flex-shrink-0 text-center mb-6">
              <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
                Choose Your Look
              </h1>
              <p className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>
                Pick a theme that fits your style
              </p>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-3 mb-4">
              {/* Dark Theme */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleThemeSelect('dark')}
                className="w-full rounded-2xl overflow-hidden border-3 transition-all"
                style={{
                  borderColor: theme === 'dark' ? 'var(--accent)' : 'transparent',
                  borderWidth: 3,
                }}
              >
                <div className="bg-[#0A0A0A] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#1A1A1A]" />
                      <div className="h-2 w-20 bg-[#1A1A1A] rounded" />
                    </div>
                    {theme === 'dark' && (
                      <div className="w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 flex-1 bg-[#1A1A1A] rounded-lg" />
                    <div className="h-10 flex-1 bg-[#1A1A1A] rounded-lg" />
                    <div className="h-10 flex-1 bg-[#1A1A1A] rounded-lg" />
                  </div>
                  <p className="text-[14px] font-semibold text-white text-center pt-1">
                    Dark Mode
                  </p>
                </div>
              </motion.button>

              {/* Light Theme */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleThemeSelect('light')}
                className="w-full rounded-2xl overflow-hidden transition-all"
                style={{
                  borderColor: theme === 'light' ? 'var(--accent)' : 'transparent',
                  borderWidth: 3,
                }}
              >
                <div className="bg-[#FAFAF8] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#E8E8E6]" />
                      <div className="h-2 w-20 bg-[#E8E8E6] rounded" />
                    </div>
                    {theme === 'light' && (
                      <div className="w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 flex-1 bg-white border border-[#E8E8E6] rounded-lg" />
                    <div className="h-10 flex-1 bg-white border border-[#E8E8E6] rounded-lg" />
                    <div className="h-10 flex-1 bg-white border border-[#E8E8E6] rounded-lg" />
                  </div>
                  <p className="text-[14px] font-semibold text-gray-900 text-center pt-1">
                    Light Mode
                  </p>
                </div>
              </motion.button>
            </div>
            <div className="flex-shrink-0 space-y-3">
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep(4)} className="btn-primary w-full">
                Continue
              </motion.button>
              <button onClick={() => setStep(2)} className="w-full py-3 text-[15px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Go back
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Profile Photo */}
        {step === 4 && (
          <motion.div
            key="photo"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex-1 flex flex-col min-h-0 px-6 pt-12 pb-4"
          >
            <div className="flex-shrink-0 text-center mb-6">
              <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
                Add a photo?
              </h1>
              <p className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>
                Totally optional
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center min-h-0">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="relative">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover" style={{ border: '3px solid var(--accent)' }} />
                ) : (
                  <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)', border: '2px dashed var(--border)' }}>
                    <svg className="w-12 h-12" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
                {!profilePicture && (
                  <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                    <svg className="w-5 h-5" style={{ color: '#0A0A0A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                )}
              </button>
              {profilePicture && (
                <button onClick={() => setProfilePicture(null)} className="mt-4 text-[14px]" style={{ color: 'var(--text-tertiary)' }}>
                  Remove photo
                </button>
              )}
            </div>
            <div className="flex-shrink-0 space-y-3">
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleComplete} className="btn-primary w-full">
                {profilePicture ? 'Finish' : 'Skip for now'}
              </motion.button>
              <button onClick={() => setStep(3)} className="w-full py-3 text-[15px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Go back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-2 rounded-full transition-all"
            style={{
              background: step >= i ? 'var(--accent)' : 'var(--bg-tertiary)',
              width: step === i ? 24 : 8,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default Onboarding
