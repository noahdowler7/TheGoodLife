import { useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
import { modalBackdropVariants, sheetVariants } from '../utils/animations'

function useBodyScrollLock(isLocked) {
  useLayoutEffect(() => {
    if (!isLocked) return

    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [isLocked])
}

function SheetModal({ title, onClose, children }) {
  useBodyScrollLock(true)

  return (
    <>
      <motion.div
        variants={modalBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 bg-black/50"
        style={{ touchAction: 'none' }}
        onClick={onClose}
        onTouchMove={(e) => e.preventDefault()}
      />
      <motion.div
        variants={sheetVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl"
        style={{ height: '85vh', background: 'var(--bg-secondary)' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="w-9 h-1 rounded-full mx-auto mt-2 mb-4" style={{ background: 'var(--text-muted)', opacity: 0.4 }} />
        <div style={{ height: 'calc(85vh - 28px)', overflowY: 'scroll', WebkitOverflowScrolling: 'touch' }}>
          <div className="px-4 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button type="button" onClick={onClose} className="btn-text -ml-3">
                Cancel
              </button>
              <h2 className="headline">{title}</h2>
              <div className="w-16" />
            </div>
            {children}
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default SheetModal
