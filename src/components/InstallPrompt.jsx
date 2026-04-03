import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DISMISSED_KEY = 'thegoodlife_install_dismissed'

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
}

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [showIOS, setShowIOS] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isInStandaloneMode()) return
    if (localStorage.getItem(DISMISSED_KEY)) return

    if (isIOS()) {
      const t = setTimeout(() => setShowIOS(true), 5000)
      return () => clearTimeout(t)
    }

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setTimeout(() => setVisible(true), 5000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
    setShowIOS(false)
  }

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    await prompt.userChoice
    dismiss()
  }

  const showAndroid = visible && prompt && !isIOS()

  return (
    <AnimatePresence>
      {(showAndroid || showIOS) && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl p-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 -4px 30px rgba(0,0,0,0.4)' }}
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212, 168, 67, 0.15)' }}>
              <svg className="w-6 h-6" style={{ color: '#D4A843' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                Install The Good Life
              </p>
              {showIOS ? (
                <p className="text-[13px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  Tap the <strong>Share</strong> button below, then <strong>"Add to Home Screen"</strong> for the full app experience.
                </p>
              ) : (
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  Get the full app experience — works offline, launches from your home screen.
                </p>
              )}
            </div>
            <button
              onClick={dismiss}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showAndroid && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={install}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold"
                style={{ background: '#D4A843', color: '#0A0A0A' }}
              >
                Install App
              </button>
              <button
                onClick={dismiss}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-medium"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                Not now
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
