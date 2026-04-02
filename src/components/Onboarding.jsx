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
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <AnimatePresence mode="wait">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <motion.div
            key="welcome"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex-1 flex flex-col items-center justify-center px-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-4"
            >
              <MovementLogo width={220} />
            </motion.div>
            <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
              The Good Life
            </h1>
            <p className="text-[17px] leading-relaxed mb-8 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              Know God. Find Freedom. Discover Purpose. Make a Difference.
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(1)}
              className="btn-primary w-full max-w-xs"
            >
              Get Started
            </motion.button>
          </motion.div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <motion.div
            key="name"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex-1 flex flex-col px-6 pt-16 pb-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
                What's your name?
              </h1>
              <p className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>
                For personalized greetings
              </p>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="input-field text-center text-[18px]"
                autoFocus
              />
            </div>
            <div className="space-y-3">
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep(2)} className="btn-primary w-full">
                Continue
              </motion.button>
              <button onClick={() => setStep(0)} className="w-full py-3 text-[15px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Go back
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Why Five Capitals? */}
        {step === 2 && (
          <motion.div
            key="why-capitals"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex-1 flex flex-col px-6 pt-16 pb-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
                The Five Capitals
              </h1>
              <p className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>
                A framework for life aligned with God's priorities
              </p>
            </div>
            <div className="flex-1 flex flex-col justify-center overflow-y-auto space-y-6 mb-6">
              {/* Priority Pyramid - Centered */}
              <div className="space-y-2 flex flex-col items-center">
                {CAPITAL_ORDER.map((id, index) => {
                  const capital = CAPITALS[id]
                  const width = 100 - (index * 15)
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="w-full flex justify-center"
                    >
                      <div
                        className="h-12 rounded-xl flex items-center justify-center font-medium text-[15px] text-white shadow-lg"
                        style={{
                          background: capital.color,
                          width: `${width}%`
                        }}
                      >
                        {capital.name}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Explanation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-surface border border-border rounded-2xl p-5 space-y-3"
              >
                <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Invest</strong> in what matters. <strong style={{ color: 'var(--text-primary)' }}>Grow</strong> in every area. <strong style={{ color: 'var(--text-primary)' }}>Align</strong> your life with God's design.
                </p>
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  When you prioritize the Spiritual first, everything else finds its proper place. This isn't about balance—it's about alignment.
                </p>
              </motion.div>
            </div>
            <div className="space-y-3 mt-auto">
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep(3)} className="btn-primary w-full">
                Continue
              </motion.button>
              <button onClick={() => setStep(1)} className="w-full py-3 text-[15px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Go back
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Capital Focus with Descriptions */}
        {step === 3 && (
          <motion.div
            key="capitals"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex-1 flex flex-col px-6 pt-16 pb-8"
          >
            <div className="text-center mb-6">
              <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
                Your Five Capitals
              </h1>
              <p className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>
                Choose where God is calling you to grow
              </p>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-6">
              {CAPITAL_ORDER.map(id => {
                const capital = CAPITALS[id]
                const enabled = capitals[id]
                return (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleCapital(id)}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all"
                    style={{
                      background: enabled ? `${capital.color}15` : 'var(--bg-card)',
                      border: `2px solid ${enabled ? capital.color : 'var(--border)'}`,
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: enabled ? capital.color : 'var(--bg-tertiary)' }}>
                      <div className="w-4 h-4 rounded-full" style={{ background: enabled ? 'white' : 'var(--text-muted)' }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[16px] font-medium mb-1" style={{ color: enabled ? capital.color : 'var(--text-primary)' }}>
                        {capital.name}
                      </p>
                      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                        {capital.description}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${enabled ? '' : 'border-2'}`}
                      style={enabled ? { background: capital.color } : { borderColor: 'var(--text-muted)' }}
                    >
                      {enabled && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
            <div className="space-y-3 mt-auto">
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep(4)} className="btn-primary w-full">
                Continue
              </motion.button>
              <button onClick={() => setStep(2)} className="w-full py-3 text-[15px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Go back
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Theme Selection */}
        {step === 4 && (
          <motion.div
            key="theme"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex-1 flex flex-col px-6 pt-16 pb-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
                Choose Your Look
              </h1>
              <p className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>
                Pick a theme that fits your style
              </p>
            </div>
            <div className="flex-1 flex flex-col justify-center overflow-y-auto space-y-4 mb-6">
              {/* Dark Theme */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleThemeSelect('dark')}
                className="relative rounded-2xl overflow-hidden border-4 transition-all"
                style={{
                  borderColor: theme === 'dark' ? 'var(--accent)' : 'transparent',
                }}
              >
                <div className="bg-[#0A0A0A] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1A1A1A]" />
                      <div className="h-3 w-24 bg-[#1A1A1A] rounded" />
                    </div>
                    {theme === 'dark' && (
                      <div className="w-6 h-6 rounded-full bg-gold-400 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-[#1A1A1A] rounded w-full" />
                    <div className="h-2 bg-[#1A1A1A] rounded w-3/4" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-16 flex-1 bg-[#1A1A1A] rounded-xl" />
                    <div className="h-16 flex-1 bg-[#1A1A1A] rounded-xl" />
                  </div>
                  <p className="text-[15px] font-semibold text-white text-center pt-2">
                    Dark Mode
                  </p>
                </div>
              </motion.button>

              {/* Light Theme */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleThemeSelect('light')}
                className="relative rounded-2xl overflow-hidden border-4 transition-all"
                style={{
                  borderColor: theme === 'light' ? 'var(--accent)' : 'transparent',
                }}
              >
                <div className="bg-[#FAFAF8] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#E8E8E6]" />
                      <div className="h-3 w-24 bg-[#E8E8E6] rounded" />
                    </div>
                    {theme === 'light' && (
                      <div className="w-6 h-6 rounded-full bg-gold-400 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-[#E8E8E6] rounded w-full" />
                    <div className="h-2 bg-[#E8E8E6] rounded w-3/4" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-16 flex-1 bg-white border border-[#E8E8E6] rounded-xl" />
                    <div className="h-16 flex-1 bg-white border border-[#E8E8E6] rounded-xl" />
                  </div>
                  <p className="text-[15px] font-semibold text-gray-900 text-center pt-2">
                    Light Mode
                  </p>
                </div>
              </motion.button>
            </div>
            <div className="space-y-3 mt-auto">
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep(5)} className="btn-primary w-full">
                Continue
              </motion.button>
              <button onClick={() => setStep(3)} className="w-full py-3 text-[15px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Go back
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Profile Photo */}
        {step === 5 && (
          <motion.div
            key="photo"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex-1 flex flex-col px-6 pt-16 pb-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
                Add a photo?
              </h1>
              <p className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>
                Totally optional
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
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
            <div className="space-y-3">
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleComplete} className="btn-primary w-full">
                {profilePicture ? 'Finish' : 'Skip for now'}
              </motion.button>
              <button onClick={() => setStep(4)} className="w-full py-3 text-[15px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Go back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-8">
        {[0, 1, 2, 3, 4, 5].map((i) => (
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
