import { useState, useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import PageWrapper from './PageWrapper'
import SheetModal from './SheetModal'

const EVENT_TYPES = [
  { id: 'church', label: 'Church Event', color: '#D4A843' },
  { id: 'fasting', label: 'Fasting Day', color: '#B07EE0' },
  { id: 'milestone', label: 'Spiritual Milestone', color: '#5BB98B' },
  { id: 'community', label: 'Community Group', color: '#6B8DE3' },
  { id: 'personal', label: 'Personal', color: '#E07B6A' },
]

function Calendar({ events, setEvents, disciplines }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return events.filter(e => e.date === dateStr)
  }

  // Check if a date has discipline completions (for streak highlighting)
  const hasCompletions = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayData = disciplines?.[dateStr]
    return dayData && Object.values(dayData).some(v => v)
  }

  const handleSaveEvent = (eventData) => {
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...eventData } : e))
    } else {
      setEvents(prev => [...prev, { id: uuidv4(), ...eventData, date: format(selectedDate || new Date(), 'yyyy-MM-dd'), createdAt: new Date().toISOString() }])
    }
    setShowEventModal(false)
    setEditingEvent(null)
  }

  const handleDeleteEvent = (eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
    setEditingEvent(null)
  }

  return (
    <PageWrapper className="min-h-screen pb-24">
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(prev => subMonths(prev, 1))} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
            <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-[24px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </h1>
          </div>
          <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
            <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()) }}
            className="px-4 py-1.5 rounded-full text-[13px] font-medium"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            Today
          </button>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="px-5">
        <div className="rounded-3xl p-4" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
          <div className="grid grid-cols-7 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-[12px] font-semibold py-2" style={{ color: 'var(--text-muted)' }}>
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayEvents = getEventsForDate(day)
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isTodayDate = isToday(day)
              const hasActivity = hasCompletions(day)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className="relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all"
                  style={{
                    background: isSelected ? 'var(--accent)' : isTodayDate ? 'var(--accent-light)' : 'transparent',
                    color: isSelected ? '#0A0A0A' : !isCurrentMonth ? 'var(--text-muted)' : isTodayDate ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                >
                  <span className={`text-[15px] ${isTodayDate || isSelected ? 'font-semibold' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {/* Streak ring indicator */}
                  {hasActivity && !isSelected && (
                    <div className="absolute inset-0.5 rounded-2xl" style={{ border: '2px solid var(--accent)', opacity: 0.3 }} />
                  )}
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1.5 flex gap-0.5">
                      {dayEvents.slice(0, 3).map((event, i) => {
                        const type = EVENT_TYPES.find(t => t.id === event.type)
                        return (
                          <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? '#0A0A0A' : (type?.color || 'var(--accent)') }} />
                        )
                      })}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Events */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="px-5 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {format(selectedDate, 'EEEE, MMMM d')}
              </h2>
              <button onClick={() => setShowEventModal(true)} className="text-[14px] font-medium" style={{ color: 'var(--accent)' }}>
                + Add
              </button>
            </div>
            <div className="space-y-3">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((event) => {
                  const type = EVENT_TYPES.find(t => t.id === event.type)
                  return (
                    <div
                      key={event.id}
                      onClick={() => setEditingEvent(event)}
                      className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
                      style={{ background: 'var(--bg-card)', borderLeft: `4px solid ${type?.color || 'var(--accent)'}` }}
                    >
                      <div className="flex-1">
                        <p className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>{event.title}</p>
                        {event.time && <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{event.time}</p>}
                        {event.notes && <p className="text-[13px] mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{event.notes}</p>}
                      </div>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${type?.color}20`, color: type?.color }}>
                        {type?.label}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-card)' }}>
                  <p className="text-[15px]" style={{ color: 'var(--text-tertiary)' }}>No events scheduled</p>
                  <button onClick={() => setShowEventModal(true)} className="mt-3 text-[14px] font-medium" style={{ color: 'var(--accent)' }}>Add an event</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Modal */}
      <AnimatePresence>
        {(showEventModal || editingEvent) && (
          <EventModal
            event={editingEvent}
            onSave={handleSaveEvent}
            onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : null}
            onClose={() => { setShowEventModal(false); setEditingEvent(null) }}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}

function EventModal({ event, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(event?.title || '')
  const [time, setTime] = useState(event?.time || '')
  const [type, setType] = useState(event?.type || 'church')
  const [notes, setNotes] = useState(event?.notes || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), time, type, notes: notes.trim() })
  }

  return (
    <SheetModal title={event ? 'Edit Event' : 'New Event'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="card-inset mx-0 mb-5">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event name" className="w-full px-4 py-3.5 bg-transparent body outline-none" style={{ color: 'var(--text-primary)' }} autoFocus />
          <div className="separator mx-4" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-4 py-3.5 bg-transparent body outline-none" style={{ color: 'var(--text-primary)' }} />
          <div className="separator mx-4" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={2} className="w-full px-4 py-3.5 bg-transparent body outline-none resize-none" style={{ color: 'var(--text-primary)' }} />
        </div>

        <p className="list-header px-0">EVENT TYPE</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {EVENT_TYPES.map(t => (
            <button key={t.id} type="button" onClick={() => setType(t.id)}
              className="px-4 py-2 rounded-full text-[13px] font-medium transition-all"
              style={{
                background: type === t.id ? t.color : 'var(--bg-tertiary)',
                color: type === t.id ? 'white' : 'var(--text-secondary)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button type="submit" disabled={!title.trim()} className="btn-primary w-full">
          {event ? 'Save' : 'Add Event'}
        </button>

        {onDelete && (
          <button type="button" onClick={() => { if (confirm('Delete this event?')) onDelete() }}
            className="w-full mt-3 py-3.5 text-center rounded-full" style={{ color: 'var(--danger)' }}>
            Delete Event
          </button>
        )}
      </form>
    </SheetModal>
  )
}

export default Calendar
