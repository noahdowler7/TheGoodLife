import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { compressImage } from '../utils/imageUtils'
import { CAPITALS, CAPITAL_ORDER } from '../utils/capitals'

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
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
      profilePicture: profilePicture || null,
    })
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
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
              style={{ background: 'var(--accent-light)' }}
            >
              <svg className="w-10 h-10" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </motion.div>
            <h1 className="text-[32px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              The Good Life
            </h1>
            <p className="text-[15px] mb-2" style={{ color: 'var(--accent)' }}>
              Movement Church
            </p>
            <p className="text-[17px] leading-relaxed mb-8 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              Invest in what matters most. Track your Five Capitals and grow daily.
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
              <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
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

        {/* Step 2: Capital Focus */}
        {step === 2 && (
          <motion.div
            key="capitals"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex-1 flex flex-col px-6 pt-16 pb-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Your Five Capitals
              </h1>
              <p className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>
                Choose which areas to focus on
              </p>
            </div>
            <div className="flex-1 space-y-3">
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
                      <p className="text-[16px] font-medium" style={{ color: enabled ? capital.color : 'var(--text-primary)' }}>
                        {capital.name}
                      </p>
                      <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                        {capital.disciplines.length} disciplines
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
            <div className="space-y-3 mt-6">
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep(3)} className="btn-primary w-full">
                Continue
              </motion.button>
              <button onClick={() => setStep(1)} className="w-full py-3 text-[15px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Go back
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Profile Photo */}
        {step === 3 && (
          <motion.div
            key="photo"
            variants={containerVariants}
            initial="hidden" animate="visible" exit="exit"
            className="flex-1 flex flex-col px-6 pt-16 pb-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
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
              <button onClick={() => setStep(2)} className="w-full py-3 text-[15px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Go back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-8">
        {[0, 1, 2, 3].map((i) => (
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
