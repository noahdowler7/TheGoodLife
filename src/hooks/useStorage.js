import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_DEBOUNCE_MS = 300

const STORAGE_KEYS = {
  DISCIPLINES: 'thegoodlife_disciplines',
  REFLECTIONS: 'thegoodlife_reflections',
  RATINGS: 'thegoodlife_ratings',
  EVENTS: 'thegoodlife_events',
  FASTING: 'thegoodlife_fasting',
  PARTNERS: 'thegoodlife_partners',
  CUSTOM_DISCIPLINES: 'thegoodlife_custom_disc',
  SETTINGS: 'thegoodlife_settings',
}

function getStorageItem(key, defaultValue) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading ${key}:`, error)
    return defaultValue
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error writing ${key}:`, error)
    return false
  }
}

export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(() => getStorageItem(key, defaultValue))
  const writeTimeoutRef = useRef(null)
  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    if (writeTimeoutRef.current) clearTimeout(writeTimeoutRef.current)
    writeTimeoutRef.current = setTimeout(() => {
      writeTimeoutRef.current = null
      setStorageItem(key, valueRef.current)
    }, STORAGE_DEBOUNCE_MS)
    return () => {
      if (writeTimeoutRef.current) {
        clearTimeout(writeTimeoutRef.current)
        writeTimeoutRef.current = null
        setStorageItem(key, valueRef.current)
      }
    }
  }, [key, value])

  const updateValue = useCallback((newValue) => {
    setValue(prev => typeof newValue === 'function' ? newValue(prev) : newValue)
  }, [])

  return [value, updateValue]
}

// Disciplines: { "2026-03-30": { "bible-reading": true, "prayer": true, ... } }
export function useDisciplines() {
  return useStorage(STORAGE_KEYS.DISCIPLINES, {})
}

// Reflections: { "2026-03-30": { spiritual: "text...", relational: "text...", ... } }
export function useReflections() {
  return useStorage(STORAGE_KEYS.REFLECTIONS, {})
}

// Ratings: { "2026-03-30": { spiritual: 4, relational: 3, ... } }
export function useRatings() {
  return useStorage(STORAGE_KEYS.RATINGS, {})
}

// Events: [{ id, title, date, type, notes }]
export function useEvents() {
  return useStorage(STORAGE_KEYS.EVENTS, [])
}

// Fasting: [{ id, date, type, startTime, endTime, notes, completed }]
export function useFasting() {
  return useStorage(STORAGE_KEYS.FASTING, [])
}

// Partners: [{ id, name, color, createdAt }]
export function usePartners() {
  return useStorage(STORAGE_KEYS.PARTNERS, [])
}

// Custom disciplines: [{ id, label, capitalId }]
export function useCustomDisciplines() {
  return useStorage(STORAGE_KEYS.CUSTOM_DISCIPLINES, [])
}

// Default application settings
const DEFAULT_SETTINGS = {
  theme: 'dark',
  startOfWeek: 0,

  // Capitals toggles (all on by default)
  capitals: {
    spiritual: true,
    relational: true,
    physical: true,
    intellectual: true,
    financial: true,
  },

  // User profile
  currentUser: null,
  profilePicture: null,

  // Onboarding
  onboardingComplete: false,
  introGuideComplete: false,
}

export function useSettings() {
  return useStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
}

export { STORAGE_KEYS }
