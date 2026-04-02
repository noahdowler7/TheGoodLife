import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navigation from './components/Navigation'
import Onboarding from './components/Onboarding'
import IntroGuide from './components/IntroGuide'
import Dashboard from './components/Dashboard'
import DisciplineTracker from './components/DisciplineTracker'
import WeeklyProgress from './components/WeeklyProgress'
import Calendar from './components/Calendar'
import FastingTracker from './components/FastingTracker'
import DevotionalGuide from './components/DevotionalGuide'
import Settings from './components/Settings'
import PartnerSummary from './components/PartnerSummary'
import AuthScreen from './components/AuthScreen'
import InstallPrompt from './components/InstallPrompt'
import DataMigration from './components/DataMigration'
import SyncStatus from './components/SyncStatus'
import {
  useDisciplines,
  useReflections,
  useRatings,
  useEvents,
  useFasting,
  usePartners,
  useCustomDisciplines,
  useSettings,
} from './hooks/useStorage'
import { useAuth } from './hooks/useAuth'

function AuthVerify({ verify }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) { navigate('/', { replace: true }); return }
    verify(token)
      .then(() => navigate('/', { replace: true }))
      .catch(() => setStatus('error'))
  }, [])

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <div>
          <p className="text-text-primary text-lg font-semibold mb-2">Link expired or invalid</p>
          <p className="text-text-secondary text-sm mb-4">Request a new sign-in link from the app.</p>
          <button onClick={() => navigate('/', { replace: true })} className="py-2 px-6 bg-primary text-white rounded-xl">
            Go to App
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-text-secondary">Signing you in…</p>
    </div>
  )
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, isGuest, hasAccess, continueAsGuest, login, verify, loading, error } = useAuth()
  const [disciplines, setDisciplines] = useDisciplines()
  const [reflections, setReflections] = useReflections()
  const [ratings, setRatings] = useRatings()
  const [events, setEvents] = useEvents()
  const [fasting, setFasting] = useFasting()
  const [partners, setPartners] = usePartners()
  const [customDisciplines, setCustomDisciplines] = useCustomDisciplines()
  const [settings, setSettings] = useSettings()
  const [migrationChecked, setMigrationChecked] = useState(false)
  const [showAuthScreen, setShowAuthScreen] = useState(false)

  // Apply theme to document
  useEffect(() => {
    const theme = settings?.theme || 'dark'
    document.documentElement.setAttribute('data-theme', theme)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0A0A0A' : '#FAFAF8')
    }
  }, [settings?.theme])

  const appState = {
    disciplines, setDisciplines,
    reflections, setReflections,
    ratings, setRatings,
    events, setEvents,
    fasting, setFasting,
    partners, setPartners,
    customDisciplines, setCustomDisciplines,
    settings, setSettings,
  }

  const handleOnboardingComplete = (profile) => {
    setSettings(prev => ({
      ...prev,
      currentUser: { name: profile.name },
      profilePicture: profile.profilePicture || prev.profilePicture,
      capitals: profile.capitals || prev.capitals,
      onboardingComplete: true,
    }))
  }

  const handleIntroGuideComplete = () => {
    setSettings(prev => ({
      ...prev,
      introGuideComplete: true,
    }))
    navigate('/', { replace: true })
  }

  const handleAuthComplete = () => {
    setShowAuthScreen(false)
    // Reset migration check when user authenticates
    setMigrationChecked(false)
  }

  // First launch - auto continue as guest (skip WelcomeScreen)
  useEffect(() => {
    if (!hasAccess && !showAuthScreen) {
      continueAsGuest()
    }
  }, [hasAccess, showAuthScreen, continueAsGuest])

  // Handle magic link verify route before any other auth checks
  if (location.pathname === '/auth/verify') {
    return (
      <Routes>
        <Route path="/auth/verify" element={<AuthVerify verify={verify} />} />
      </Routes>
    )
  }

  // Show auth screen if explicitly requested
  if (showAuthScreen && !isAuthenticated) {
    return <AuthScreen onLogin={login} onVerify={verify} loading={loading} error={error} />
  }

  // Check for data migration (only for authenticated users, not guests)
  const needsMigration = isAuthenticated &&
    !migrationChecked &&
    !localStorage.getItem('thegoodlife_migrated') &&
    localStorage.getItem('thegoodlife_disciplines')

  if (needsMigration) {
    return (
      <DataMigration
        onComplete={() => {
          setMigrationChecked(true)
          handleAuthComplete()
        }}
        onSkip={() => {
          setMigrationChecked(true)
          handleAuthComplete()
        }}
      />
    )
  }

  if (!settings?.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  if (!settings?.introGuideComplete) {
    return <IntroGuide onComplete={handleIntroGuideComplete} />
  }

  return (
    <div className="min-h-screen">
      {isAuthenticated && <SyncStatus />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard {...appState} />} />
          <Route path="/today" element={<DisciplineTracker {...appState} />} />
          <Route path="/week" element={<WeeklyProgress {...appState} />} />
          <Route path="/calendar" element={<Calendar {...appState} />} />
          <Route path="/fasting" element={<FastingTracker {...appState} />} />
          <Route path="/devotional" element={<DevotionalGuide {...appState} />} />
          <Route
            path="/settings"
            element={
              <Settings
                {...appState}
                isGuest={isGuest}
                onSignIn={() => setShowAuthScreen(true)}
              />
            }
          />
          <Route path="/partners/:id" element={<PartnerSummary />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <Navigation settings={settings} />
      <InstallPrompt />
    </div>
  )
}

export default App
