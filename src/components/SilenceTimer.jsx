import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

const DURATIONS = [2, 5, 10, 15, 20]

const SILENCE_VERSES = [
  { text: 'Be still, and know that I am God.', ref: 'Psalm 46:10' },
  { text: 'The Lord is in his holy temple; let all the earth be silent before him.', ref: 'Habakkuk 2:20' },
  { text: 'In returning and rest you shall be saved; in quietness and confidence shall be your strength.', ref: 'Isaiah 30:15' },
  { text: 'Be still before the Lord and wait patiently for him.', ref: 'Psalm 37:7' },
  { text: 'He says, "Be still, and know that I am God."', ref: 'Psalm 46:10' },
  { text: 'The Lord will fight for you; you need only to be still.', ref: 'Exodus 14:14' },
  { text: 'Come to me, all you who are weary and burdened, and I will give you rest.', ref: 'Matthew 11:28' },
]

export default function SilenceTimer({ reflections, setReflections, setDisciplines }) {
  const [active, setActive] = useState(false)
  const [selectedMinutes, setSelectedMinutes] = useState(5)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [note, setNote] = useState('')
  const wakeLockRef = useRef(null)
  const intervalRef = useRef(null)
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const verse = SILENCE_VERSES[new Date().getDate() % SILENCE_VERSES.length]

  const startTimer = async () => {
    setSecondsLeft(selectedMinutes * 60)
    setActive(true)
    setCompleted(false)

    // Try to keep screen awake
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      }
    } catch {}
  }

  useEffect(() => {
    if (!active || secondsLeft <= 0) return

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setActive(false)
          setCompleted(true)
          // Vibrate if available
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          // Release wake lock
          wakeLockRef.current?.release()
          // Mark meditation discipline complete
          setDisciplines?.(prev => ({
            ...prev,
            [todayStr]: { ...(prev[todayStr] || {}), meditation: true },
          }))
          // Save to reflections
          setReflections?.(prev => ({
            ...prev,
            [todayStr]: {
              ...(prev[todayStr] || {}),
              silence: { duration: selectedMinutes * 60, completed: true },
            },
          }))
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [active, secondsLeft])

  const stopTimer = () => {
    clearInterval(intervalRef.current)
    setActive(false)
    setSecondsLeft(0)
    wakeLockRef.current?.release()
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // Active timer view
  if (active) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8"
        style={{ background: '#050505' }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-28 h-28 rounded-full mb-10 flex items-center justify-center"
          style={{ background: 'rgba(212, 168, 67, 0.08)', border: '1px solid rgba(212, 168, 67, 0.15)' }}
        >
          <p className="text-[28px] font-light" style={{ color: '#D4A843', fontFamily: "'Georgia', serif" }}>
            {formatTime(secondsLeft)}
          </p>
        </motion.div>

        <p className="text-[18px] italic leading-relaxed text-center mb-3"
          style={{ color: 'rgba(245, 245, 245, 0.7)', fontFamily: "'Georgia', serif" }}
        >
          "{verse.text}"
        </p>
        <p className="text-[12px] tracking-widest uppercase mb-16" style={{ color: 'rgba(245, 245, 245, 0.3)' }}>
          {verse.ref}
        </p>

        <button
          onClick={stopTimer}
          className="text-[13px] px-6 py-2 rounded-full"
          style={{ color: 'rgba(245, 245, 245, 0.4)', border: '1px solid rgba(245, 245, 245, 0.15)' }}
        >
          End Early
        </button>
      </div>
    )
  }

  // Completed view
  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: '#5BB98B' }}>
          Silence Complete
        </p>
        <p className="text-[15px] mb-3" style={{ color: 'var(--text-primary)' }}>
          Amen. {selectedMinutes} minutes with God.
        </p>
        <textarea
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            setReflections?.(prev => ({
              ...prev,
              [todayStr]: {
                ...(prev[todayStr] || {}),
                silence: { ...(prev[todayStr]?.silence || {}), note: e.target.value },
              },
            }))
          }}
          placeholder="How was your time with God? (optional)"
          rows={2}
          className="w-full px-3 py-2 rounded-xl text-[14px] outline-none resize-none mb-3"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        />
        <button
          onClick={() => setCompleted(false)}
          className="text-[13px] font-medium"
          style={{ color: 'var(--accent)' }}
        >
          Done
        </button>
      </motion.div>
    )
  }

  // Setup view
  return (
    <div className="rounded-2xl p-4"
      style={{ background: 'rgba(212, 168, 67, 0.06)', border: '1px solid rgba(212, 168, 67, 0.15)' }}
    >
      <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: '#D4A843' }}>
        Silence & Solitude
      </p>
      <div className="flex gap-2 mb-3">
        {DURATIONS.map(d => (
          <button
            key={d}
            onClick={() => setSelectedMinutes(d)}
            className="flex-1 py-2 rounded-xl text-[13px] font-medium"
            style={{
              background: selectedMinutes === d ? '#D4A84320' : 'var(--bg-tertiary)',
              border: `2px solid ${selectedMinutes === d ? '#D4A843' : 'var(--border)'}`,
              color: selectedMinutes === d ? '#D4A843' : 'var(--text-muted)',
            }}
          >
            {d}m
          </button>
        ))}
      </div>
      <button
        onClick={startTimer}
        className="w-full py-3 rounded-xl text-[14px] font-semibold"
        style={{ background: '#D4A843', color: '#0A0A0A' }}
      >
        Begin Silence
      </button>
    </div>
  )
}
