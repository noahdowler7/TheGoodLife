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
  const [prompt, setPrompt] = useState(null) // Android deferred prompt
  const [showIOS, setShowIOS] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isInStandaloneMode()) return
    if (localStorage.getItem(DISMISSED_KEY)) return

    if (isIOS()) {
      // Delay slightly so it doesn't appear on first load
      const t = setTimeout(() => setShowIOS(true), 3000)
      return () => clearTimeout(t)
    }

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setTimeout(() => setVisible(true), 3000)
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
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') dismiss()
    else dismiss()
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
          className="fixed bottom-20 left-4 right-4 z-50 bg-surface border border-border rounded-2xl p-4 shadow-xl"
        >
          <div className="flex items-start gap-3">
            <img src="/icons/icon-192.svg" alt="" className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-text-primary font-semibold text-sm">Add to Home Screen</p>
              {showIOS ? (
                <p className="text-text-secondary text-xs mt-0.5">
                  Tap <span className="inline-block">⎙</span> Share, then "Add to Home Screen" for the full app experience.
                </p>
              ) : (
                <p className="text-text-secondary text-xs mt-0.5">
                  Install The Good Life for the full app experience — works offline too.
                </p>
              )}
            </div>
            <button
              onClick={dismiss}
              className="text-text-tertiary hover:text-text-secondary text-lg leading-none flex-shrink-0 mt-0.5"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>

          {showAndroid && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={install}
                className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-medium"
              >
                Install
              </button>
              <button
                onClick={dismiss}
                className="flex-1 py-2 bg-surface border border-border text-text-secondary rounded-xl text-sm"
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
