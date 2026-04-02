import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Fasting Card ─────────────────────────────────────────────────────────────
// Like Financial, fasting is a rhythm not a daily requirement.
// Any selection marks it complete — including "Not fasting today."
const FASTING_OPTIONS = [
  { id: 'full', label: 'Full Day Fast', description: 'Abstaining from all food' },
  { id: 'partial', label: 'Partial Fast', description: 'Fasting from a meal, media, or social' },
  { id: 'prayer', label: 'Prayer Focus', description: 'Dedicated time of prayer and seeking' },
  { id: 'not_today', label: 'Not fasting today', description: 'Rest is also a spiritual discipline' },
]

function FastingCard({ dateStr, reflections, setReflections, setDisciplines, onClose }) {
  const fastingData = reflections[dateStr]?.fasting_choice || {}
  const selected = fastingData.option

  const handleSelect = (optionId) => {
    setReflections(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), fasting_choice: { option: optionId } },
    }))
    setDisciplines(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), fasting: true },
    }))
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Fasting</p>
        <button onClick={onClose} className="text-[12px] font-medium px-3 py-1 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Close</button>
      </div>
      <p className="text-[13px] mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        Fasting is a rhythm, not a daily requirement. How are you engaging with it today?
      </p>
      <div className="space-y-2">
        {FASTING_OPTIONS.map(option => {
          const isSelected = selected === option.id
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
              style={{
                background: isSelected ? '#D4A84310' : 'var(--bg-tertiary)',
                border: `2px solid ${isSelected ? '#D4A843' : 'var(--border)'}`,
              }}
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                style={{ borderColor: isSelected ? '#D4A843' : 'var(--border)', background: isSelected ? '#D4A843' : 'transparent' }}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-[14px] font-medium" style={{ color: isSelected ? '#D4A843' : 'var(--text-primary)' }}>{option.label}</p>
                <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{option.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Lectio Divina ────────────────────────────────────────────────────────────
const LECTIO_STEPS = [
  {
    id: 'read',
    number: '1',
    title: 'Read',
    prompt: 'Read the passage slowly. What word or phrase stands out to you?',
    placeholder: 'The word or phrase that caught my attention...',
    color: '#D4A843',
  },
  {
    id: 'reflect',
    number: '2',
    title: 'Reflect',
    prompt: 'Sit with that word. Why does it stand out? What is God saying through it?',
    placeholder: 'I sense God is saying...',
    color: '#5BB98B',
  },
  {
    id: 'respond',
    number: '3',
    title: 'Respond',
    prompt: 'Respond to God in prayer. What do you want to say back to him?',
    placeholder: 'Lord, I respond by...',
    color: '#6B8DE3',
  },
  {
    id: 'rest',
    number: '4',
    title: 'Rest',
    prompt: "Rest in God's presence. What do you receive from him today?",
    placeholder: 'I receive...',
    color: '#E07B6A',
  },
]

function LectioDivina({ dateStr, reflections, setReflections, setDisciplines, onClose }) {
  const lectioData = reflections[dateStr]?.lectio_divina || {}

  const handleChange = (stepId, text) => {
    const newData = { ...lectioData, [stepId]: text }
    setReflections(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), lectio_divina: newData },
    }))
    const hasAny = Object.values(newData).some(v => v?.trim())
    setDisciplines(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), meditation: hasAny },
    }))
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Lectio Divina</p>
        <button onClick={onClose} className="text-[12px] font-medium px-3 py-1 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Close</button>
      </div>
      <p className="text-[12px] italic mb-3" style={{ color: 'var(--text-tertiary)' }}>Read · Reflect · Respond · Rest</p>
      <div className="space-y-3">
        {LECTIO_STEPS.map(step => (
          <div key={step.id} className="rounded-2xl p-3" style={{ background: 'var(--bg-tertiary)', border: `1px solid ${step.color}30` }}>
            <div className="flex items-start gap-3 mb-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-[13px]"
                style={{ background: step.color }}
              >
                {step.number}
              </div>
              <div>
                <p className="text-[14px] font-semibold" style={{ color: step.color }}>{step.title}</p>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.prompt}</p>
              </div>
            </div>
            <textarea
              value={lectioData[step.id] || ''}
              onChange={(e) => handleChange(step.id, e.target.value)}
              placeholder={step.placeholder}
              rows={2}
              className="w-full px-3 py-2 rounded-xl text-[14px] outline-none resize-none leading-relaxed"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: `1px solid ${step.color}20` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Exercise Logger ──────────────────────────────────────────────────────────
const EXERCISE_DURATIONS = [15, 30, 45, 60, 90]
const EXERCISE_TYPES = ['Walk', 'Run', 'Gym', 'Sport', 'Yoga', 'Bike', 'Swim', 'Other']

function ExerciseLogger({ dateStr, reflections, setReflections, setDisciplines, onClose }) {
  const exerciseData = reflections[dateStr]?.exercise || {}

  const updateExercise = (update) => {
    const newData = { ...exerciseData, ...update }
    setReflections(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), exercise: newData },
    }))
    setDisciplines(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), exercise: !!(newData.duration || newData.type) },
    }))
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Exercise</p>
        <button onClick={onClose} className="text-[12px] font-medium px-3 py-1 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Close</button>
      </div>
      <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Duration</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {EXERCISE_DURATIONS.map(d => {
          const sel = exerciseData.duration === d
          return (
            <button
              key={d}
              onClick={() => updateExercise({ duration: sel ? null : d })}
              className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-all"
              style={{
                background: sel ? '#5BB98B20' : 'var(--bg-tertiary)',
                border: `2px solid ${sel ? '#5BB98B' : 'var(--border)'}`,
                color: sel ? '#5BB98B' : 'var(--text-secondary)',
              }}
            >
              {d} min
            </button>
          )
        })}
      </div>
      <p className="text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Type</p>
      <div className="flex flex-wrap gap-2">
        {EXERCISE_TYPES.map(t => {
          const sel = exerciseData.type === t
          return (
            <button
              key={t}
              onClick={() => updateExercise({ type: sel ? null : t })}
              className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-all"
              style={{
                background: sel ? '#5BB98B20' : 'var(--bg-tertiary)',
                border: `2px solid ${sel ? '#5BB98B' : 'var(--border)'}`,
                color: sel ? '#5BB98B' : 'var(--text-secondary)',
              }}
            >
              {t}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Encouragement Sender ─────────────────────────────────────────────────────
const ENCOURAGEMENT_TEMPLATES = [
  "Hey, just thinking about you today. Grateful to have you in my life.",
  "I've been praying for you this week. You're not alone — keep going.",
  "You're doing better than you think. God sees your faithfulness.",
  "I wanted to remind you that you are deeply loved and valued.",
  "Just checking in — how can I pray for you this week?",
]

function EncouragementSender({ dateStr, reflections, setReflections, setDisciplines, onClose }) {
  const encData = reflections[dateStr]?.encouragement || {}
  const message = encData.message || ''
  const [copied, setCopied] = useState(false)

  const setMessage = (text) => {
    setReflections(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), encouragement: { ...encData, message: text } },
    }))
    if (text.trim()) {
      setDisciplines(prev => ({
        ...prev,
        [dateStr]: { ...(prev[dateStr] || {}), encouraging: true },
      }))
    }
  }

  const handleCopy = async () => {
    if (navigator.clipboard && message) {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Encouraging Someone</p>
        <button onClick={onClose} className="text-[12px] font-medium px-3 py-1 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Close</button>
      </div>
      <p className="text-[12px] mb-3" style={{ color: 'var(--text-secondary)' }}>Choose a message or write your own, then send it to someone:</p>
      <div className="space-y-1.5 mb-3">
        {ENCOURAGEMENT_TEMPLATES.map((t, i) => (
          <button
            key={i}
            onClick={() => setMessage(t)}
            className="w-full text-left px-3 py-2 rounded-xl text-[13px] transition-all"
            style={{
              background: message === t ? '#E07B6A15' : 'var(--bg-tertiary)',
              border: `1px solid ${message === t ? '#E07B6A' : 'transparent'}`,
              color: message === t ? '#E07B6A' : 'var(--text-secondary)',
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Or write your own message..."
        rows={3}
        className="w-full px-3 py-2 rounded-xl text-[14px] outline-none resize-none mb-2"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      />
      {message.trim() && (
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium"
          style={{ background: '#E07B6A15', color: '#E07B6A', border: '1px solid #E07B6A40' }}
        >
          {copied ? '✓ Copied!' : 'Copy to send'}
        </button>
      )}
    </div>
  )
}

// ─── Health Rating ────────────────────────────────────────────────────────────
const HEALTH_LABELS = { 1: 'Struggling', 2: 'Low', 3: 'Steady', 4: 'Intentional', 5: 'Thriving' }

function HealthRating({ dateStr, reflections, setReflections, setDisciplines, onClose }) {
  const healthData = reflections[dateStr]?.healthy_eating || {}
  const rating = healthData.rating || 0

  const handleRating = (val) => {
    const newRating = val === rating ? 0 : val
    setReflections(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), healthy_eating: { ...healthData, rating: newRating } },
    }))
    setDisciplines(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), 'healthy-eating': newRating > 0 },
    }))
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Healthy Eating</p>
        <button onClick={onClose} className="text-[12px] font-medium px-3 py-1 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Close</button>
      </div>
      <p className="text-[13px] mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        How intentional was your eating today? Not about calories — about awareness and gratitude.
      </p>
      <div className="flex gap-2 mb-2">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            onClick={() => handleRating(i)}
            className="flex-1 py-3 rounded-2xl text-[15px] font-bold transition-all"
            style={{
              background: i <= rating ? '#5BB98B20' : 'var(--bg-tertiary)',
              border: `2px solid ${i <= rating ? '#5BB98B' : 'var(--border)'}`,
              color: i <= rating ? '#5BB98B' : 'var(--text-muted)',
            }}
          >
            {i}
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-[13px] font-medium text-center mt-1" style={{ color: '#5BB98B' }}>{HEALTH_LABELS[rating]}</p>
      )}
    </div>
  )
}

// ─── Reading Log ──────────────────────────────────────────────────────────────
function ReadingLog({ dateStr, reflections, setReflections, setDisciplines, onClose }) {
  const readingData = reflections[dateStr]?.reading_log || {}

  const update = (field, value) => {
    const newData = { ...readingData, [field]: value }
    setReflections(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), reading_log: newData },
    }))
    setDisciplines(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), 'reading-study': !!(newData.title?.trim() || newData.pages) },
    }))
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Reading / Study</p>
        <button onClick={onClose} className="text-[12px] font-medium px-3 py-1 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Close</button>
      </div>
      <div className="space-y-2">
        <input
          type="text"
          value={readingData.title || ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="What are you reading?"
          className="w-full px-3 py-2.5 rounded-xl text-[14px] outline-none"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={readingData.pages || ''}
            onChange={(e) => update('pages', e.target.value)}
            placeholder="Pages read"
            className="w-1/2 px-3 py-2.5 rounded-xl text-[14px] outline-none"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          />
          <input
            type="text"
            value={readingData.author || ''}
            onChange={(e) => update('author', e.target.value)}
            placeholder="Author (optional)"
            className="w-1/2 px-3 py-2.5 rounded-xl text-[14px] outline-none"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          />
        </div>
        <textarea
          value={readingData.notes || ''}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Key insight or takeaway..."
          rows={2}
          className="w-full px-3 py-2 rounded-xl text-[14px] outline-none resize-none"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        />
      </div>
    </div>
  )
}

// ─── Simple Reflection (generic) ──────────────────────────────────────────────
const SERVING_PROMPTS = [
  "Text someone and ask how they're doing.",
  "Help someone without being asked.",
  "Leave a generous tip today.",
  "Pay for the person behind you in line.",
  "Check in on someone who's been on your mind.",
  "Write a thank-you note to someone who helped you.",
  "Offer your time or skill to someone in need.",
]

const SIMPLE_CONFIGS = {
  'bible-reading': {
    title: 'Bible Reading',
    prompt: 'What did you read today? What stood out?',
    placeholder: 'Today I read...',
    storageKey: 'bible_reading',
    linkTo: '/word',
    linkLabel: 'Open Word tab',
  },
  'worship': {
    title: 'Worship',
    prompt: 'How did you worship today?',
    placeholder: "Today's worship looked like...",
    storageKey: 'worship',
  },
  'fellowship': {
    title: 'Fellowship',
    prompt: 'Who did you spend meaningful time with today?',
    placeholder: 'I spent time with...',
    storageKey: 'fellowship',
  },
  'family-time': {
    title: 'Family Time',
    prompt: 'What did you do with your family today?',
    placeholder: 'We...',
    storageKey: 'family_time',
  },
  'serving': {
    title: 'Serving Others',
    storageKey: 'serving',
    rotating: true,
    placeholder: 'I served by...',
  },
  'learning': {
    title: 'Learning',
    prompt: 'What did you learn today?',
    placeholder: 'I learned...',
    storageKey: 'learning',
  },
  'creative-work': {
    title: 'Creative Work',
    prompt: 'What did you create today?',
    placeholder: 'I created...',
    storageKey: 'creative_work',
  },
  'planning': {
    title: 'Planning / Strategy',
    prompt: 'What did you plan intentionally today?',
    placeholder: 'I planned...',
    storageKey: 'planning',
  },
  'outdoor-time': {
    title: 'Outdoor Time',
    prompt: 'How did you spend time outside today?',
    placeholder: 'I went outside and...',
    storageKey: 'outdoor_time',
  },
  'rest-sleep': {
    title: 'Rest / Sleep',
    prompt: 'How did you rest today? Any notes on sleep?',
    placeholder: 'I rested by...',
    storageKey: 'rest_sleep',
  },
}

function SimpleReflection({ disciplineId, dateStr, reflections, setReflections, setDisciplines, onClose, color }) {
  const navigate = useNavigate()
  const config = SIMPLE_CONFIGS[disciplineId]
  if (!config) return null

  const storageKey = config.storageKey
  const value = reflections[dateStr]?.[storageKey] || ''
  const servePrompt = config.rotating
    ? SERVING_PROMPTS[new Date().getDate() % SERVING_PROMPTS.length]
    : null

  const handleChange = (text) => {
    setReflections(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), [storageKey]: text },
    }))
    setDisciplines(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), [disciplineId]: text.trim().length > 0 },
    }))
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{config.title}</p>
        <button onClick={onClose} className="text-[12px] font-medium px-3 py-1 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Close</button>
      </div>
      {servePrompt && (
        <div className="rounded-xl px-3 py-2 mb-3" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color }}>Today's prompt</p>
          <p className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{servePrompt}</p>
        </div>
      )}
      {config.prompt && !servePrompt && (
        <p className="text-[13px] mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{config.prompt}</p>
      )}
      {config.linkTo && (
        <button
          onClick={() => navigate(config.linkTo)}
          className="flex items-center gap-1.5 text-[13px] font-medium mb-3 px-3 py-2 rounded-xl"
          style={{ background: `${color}15`, color }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {config.linkLabel}
        </button>
      )}
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={config.placeholder}
        rows={3}
        className="w-full px-3 py-2 rounded-xl text-[14px] outline-none resize-none leading-relaxed"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: `1px solid ${color}30` }}
        autoFocus
      />
    </div>
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export const ENRICHED_DISCIPLINES = new Set([
  'bible-reading', 'fasting', 'meditation', 'worship',
  'serving', 'fellowship', 'encouraging', 'family-time',
  'exercise', 'rest-sleep', 'healthy-eating', 'outdoor-time',
  'reading-study', 'learning', 'creative-work', 'planning',
])

export function DisciplineEnrichment({ disciplineId, dateStr, reflections, setReflections, setDisciplines, onClose, color }) {
  switch (disciplineId) {
    case 'fasting':
      return <FastingCard dateStr={dateStr} reflections={reflections} setReflections={setReflections} setDisciplines={setDisciplines} onClose={onClose} />
    case 'meditation':
      return <LectioDivina dateStr={dateStr} reflections={reflections} setReflections={setReflections} setDisciplines={setDisciplines} onClose={onClose} />
    case 'exercise':
      return <ExerciseLogger dateStr={dateStr} reflections={reflections} setReflections={setReflections} setDisciplines={setDisciplines} onClose={onClose} />
    case 'encouraging':
      return <EncouragementSender dateStr={dateStr} reflections={reflections} setReflections={setReflections} setDisciplines={setDisciplines} onClose={onClose} />
    case 'healthy-eating':
      return <HealthRating dateStr={dateStr} reflections={reflections} setReflections={setReflections} setDisciplines={setDisciplines} onClose={onClose} />
    case 'reading-study':
      return <ReadingLog dateStr={dateStr} reflections={reflections} setReflections={setReflections} setDisciplines={setDisciplines} onClose={onClose} />
    default:
      return <SimpleReflection disciplineId={disciplineId} dateStr={dateStr} reflections={reflections} setReflections={setReflections} setDisciplines={setDisciplines} onClose={onClose} color={color} />
  }
}
