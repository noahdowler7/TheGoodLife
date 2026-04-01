import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AuthScreen({ onLogin, onVerify, loading, error }) {
  const [step, setStep] = useState('email') // 'email' | 'verify'
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    try {
      const magicToken = await onLogin(email)
      // For now, auto-fill token (in production, this would be sent via email)
      setToken(magicToken)
      setStep('verify')

      // Auto-verify the token since we have it
      setTimeout(async () => {
        try {
          await onVerify(magicToken)
        } catch (err) {
          console.error('Auto-verification failed:', err)
        }
      }, 500)
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  const handleVerifySubmit = async (e) => {
    e.preventDefault()
    try {
      await onVerify(token)
    } catch (err) {
      console.error('Verification failed:', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            The Good Life
          </h1>
          <p className="text-text-secondary">
            Your spiritual operating system
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  color: '#000000',
                  backgroundColor: '#FFFFFF',
                  WebkitTextFillColor: '#000000'
                }}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-text-secondary mb-2">
                Verification Code
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter code"
                required
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="mt-2 text-xs text-text-tertiary">
                Check your email for the verification code
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full py-2 text-text-secondary text-sm hover:text-text-primary transition-colors"
            >
              Back
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
