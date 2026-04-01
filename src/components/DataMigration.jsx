import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../services/api'

export default function DataMigration({ onComplete, onSkip }) {
  const [status, setStatus] = useState('prompt') // 'prompt' | 'migrating' | 'success' | 'error'
  const [error, setError] = useState(null)
  const [counts, setCounts] = useState(null)

  const handleMigrate = async () => {
    setStatus('migrating')
    setError(null)

    try {
      // Gather all localStorage data
      const disciplines = JSON.parse(localStorage.getItem('thegoodlife_disciplines') || '{}')
      const ratings = JSON.parse(localStorage.getItem('thegoodlife_ratings') || '{}')
      const reflections = JSON.parse(localStorage.getItem('thegoodlife_reflections') || '{}')
      const events = JSON.parse(localStorage.getItem('thegoodlife_events') || '[]')
      const fasting = JSON.parse(localStorage.getItem('thegoodlife_fasting') || '[]')
      const partners = JSON.parse(localStorage.getItem('thegoodlife_partners') || '[]')
      const customDisciplines = JSON.parse(localStorage.getItem('thegoodlife_customDisciplines') || '[]')
      const settings = JSON.parse(localStorage.getItem('thegoodlife_settings') || '{}')

      // Push to server
      const response = await api.post('/api/v1/sync/push', {
        disciplines,
        ratings,
        reflections,
        events,
        fasting,
        partners,
        custom_disciplines: customDisciplines,
        settings,
      })

      setCounts(response.counts)
      setStatus('success')

      // Clear localStorage data (keep token and user)
      localStorage.removeItem('thegoodlife_disciplines')
      localStorage.removeItem('thegoodlife_ratings')
      localStorage.removeItem('thegoodlife_reflections')
      localStorage.removeItem('thegoodlife_events')
      localStorage.removeItem('thegoodlife_fasting')
      localStorage.removeItem('thegoodlife_partners')
      localStorage.removeItem('thegoodlife_customDisciplines')
      localStorage.removeItem('thegoodlife_settings')

      // Mark migration complete
      localStorage.setItem('thegoodlife_migrated', 'true')

      setTimeout(() => {
        onComplete()
      }, 2000)
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const handleSkip = () => {
    localStorage.setItem('thegoodlife_migrated', 'skipped')
    onSkip()
  }

  if (status === 'migrating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Importing your data...</p>
        </motion.div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Import Complete!</h2>
          <p className="text-text-secondary mb-4">Your data is now synced to the cloud</p>
          {counts && (
            <div className="text-sm text-text-tertiary space-y-1">
              {Object.entries(counts).map(([key, count]) => (
                count > 0 && <div key={key}>{count} {key}</div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Import Your Data?
            </h2>
            <p className="text-text-secondary">
              We found existing data on this device. Would you like to import it to your account?
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleMigrate}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Import Data
            </button>
            <button
              onClick={handleSkip}
              className="w-full py-3 bg-surface border border-border text-text-secondary rounded-xl font-medium hover:bg-background transition-colors"
            >
              Skip for Now
            </button>
          </div>

          <p className="mt-4 text-xs text-text-tertiary text-center">
            Your data will be securely synced to the cloud
          </p>
        </div>
      </motion.div>
    </div>
  )
}
