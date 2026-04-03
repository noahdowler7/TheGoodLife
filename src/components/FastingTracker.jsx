import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import PageWrapper from './PageWrapper'
import { parseScriptureRef, savePosition } from '../utils/bible'

const FAST_TYPES = [
  { id: 'full', label: 'Full Fast', description: 'No food, water only' },
  { id: 'daniel', label: 'Daniel Fast', description: 'Fruits, vegetables, water' },
  { id: 'sunrise-sunset', label: 'Sunrise to Sunset', description: 'No food during daylight' },
  { id: 'custom', label: 'Custom', description: 'Define your own fast' },
]

const BIBLICAL_REFS = [
  { text: 'When you fast, do not look somber as the hypocrites do...', ref: 'Matthew 6:16-18' },
  { text: 'Is not this the kind of fasting I have chosen: to loose the chains of injustice...', ref: 'Isaiah 58:6' },
  { text: 'So we fasted and petitioned our God about this, and he answered our prayer.', ref: 'Ezra 8:23' },
  { text: 'Then Jesus was led by the Spirit into the wilderness to be tempted by the devil. After fasting forty days...', ref: 'Matthew 4:1-2' },
  { text: 'But when you fast, put oil on your head and wash your face...', ref: 'Matthew 6:17' },
]

function FastingTracker({ fasting, setFasting }) {
  const navigate = useNavigate()
  const openScripture = (reference) => {
    const parsed = parseScriptureRef(reference)
    if (parsed) {
      savePosition(parsed.bookId, parsed.chapter)
      navigate('/devotional?tab=bible')
    }
  }
  const [tab, setTab] = useState('active')
  const [showNewFast, setShowNewFast] = useState(false)
  const [activeFastElapsed, setActiveFastElapsed] = useState(0)

  // Find active (uncompleted) fast
  const activeFast = useMemo(() => fasting.find(f => !f.completed && f.startTime), [fasting])

  // Timer for active fast
  useEffect(() => {
    if (!activeFast) return
    const updateElapsed = () => {
      const start = new Date(activeFast.startTime).getTime()
      setActiveFastElapsed(Math.floor((Date.now() - start) / 1000))
    }
    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [activeFast])

  const completedFasts = useMemo(() => fasting.filter(f => f.completed).sort((a, b) => new Date(b.date) - new Date(a.date)), [fasting])

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleStartFast = (type) => {
    const newFast = {
      id: uuidv4(),
      date: format(new Date(), 'yyyy-MM-dd'),
      type,
      startTime: new Date().toISOString(),
      endTime: null,
      notes: '',
      completed: false,
    }
    setFasting(prev => [...prev, newFast])
    setShowNewFast(false)
  }

  const handleEndFast = () => {
    if (!activeFast) return
    setFasting(prev => prev.map(f =>
      f.id === activeFast.id ? { ...f, endTime: new Date().toISOString(), completed: true } : f
    ))
  }

  const handleUpdateNotes = (notes) => {
    if (!activeFast) return
    setFasting(prev => prev.map(f =>
      f.id === activeFast.id ? { ...f, notes } : f
    ))
  }

  return (
    <PageWrapper className="min-h-screen pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-[28px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>Fasting</h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--text-tertiary)' }}>Draw closer through discipline</p>
      </header>

      {/* Tabs */}
      <div className="px-5 mb-5">
        <div className="segmented-control">
          {['active', 'history', 'resources'].map(t => (
            <button key={t} className={`segment ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {tab === 'active' && (
          <div className="space-y-5">
            {activeFast ? (
              /* Active Fast Display */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl p-6 text-center"
                style={{ background: 'var(--bg-card)', border: '2px solid var(--accent)' }}
              >
                <p className="text-[13px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
                  {FAST_TYPES.find(t => t.id === activeFast.type)?.label || 'Fast'} in Progress
                </p>
                <p className="text-[48px] font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatDuration(activeFastElapsed)}
                </p>
                <p className="text-[13px] mb-6" style={{ color: 'var(--text-tertiary)' }}>
                  Started {format(new Date(activeFast.startTime), 'h:mm a')}
                </p>

                {/* Journal during fast */}
                <textarea
                  value={activeFast.notes || ''}
                  onChange={(e) => handleUpdateNotes(e.target.value)}
                  placeholder="Journal your thoughts during this fast..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-[14px] outline-none resize-none mb-4"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />

                <button onClick={handleEndFast} className="btn-primary w-full">
                  End Fast
                </button>
              </motion.div>
            ) : (
              /* Start a new fast */
              <div className="space-y-3">
                <p className="text-[15px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Choose a type of fast to begin:
                </p>
                {FAST_TYPES.map(type => (
                  <motion.button
                    key={type.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStartFast(type.id)}
                    className="w-full rounded-2xl p-4 text-left flex items-center gap-4"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                      <svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>{type.label}</p>
                      <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{type.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-3">
            {completedFasts.length > 0 ? (
              completedFasts.map(fast => {
                const duration = fast.endTime && fast.startTime
                  ? Math.floor((new Date(fast.endTime) - new Date(fast.startTime)) / 1000)
                  : 0
                const type = FAST_TYPES.find(t => t.id === fast.type)
                return (
                  <div key={fast.id} className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        {type?.label || 'Fast'}
                      </span>
                      <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                        {format(new Date(fast.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                      Duration: {formatDuration(duration)}
                    </p>
                    {fast.notes && (
                      <p className="text-[13px] mt-2 italic" style={{ color: 'var(--text-muted)' }}>
                        "{fast.notes}"
                      </p>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>No completed fasts yet</p>
                <button onClick={() => setTab('active')} className="mt-3 text-[14px] font-medium" style={{ color: 'var(--accent)' }}>Start your first fast</button>
              </div>
            )}
          </div>
        )}

        {tab === 'resources' && (
          <div className="space-y-4">
            <p className="text-[15px] mb-2" style={{ color: 'var(--text-secondary)' }}>
              Biblical references on fasting:
            </p>
            {BIBLICAL_REFS.map((ref, i) => (
              <div key={i} className="scripture-card text-left">
                <p className="text-[15px] italic leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
                  "{ref.text}"
                </p>
                <button
                  onClick={() => openScripture(ref.ref)}
                  className="text-[11px] tracking-widest uppercase flex items-center gap-1"
                  style={{ color: 'var(--accent)' }}
                >
                  {ref.ref}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="h-4" />
      </div>
    </PageWrapper>
  )
}

export default FastingTracker
