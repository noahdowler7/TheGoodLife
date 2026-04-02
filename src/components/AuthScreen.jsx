import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AuthScreen({ onLogin, onVerify, loading, error }) {
  const [step, setStep] = useState('email') // 'email' | 'check-email' | 'verify'
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [sending, setSending] = useState(false)

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const result = await onLogin(email)
      if (result?.token) {
        // Dev mode: token returned directly, auto-verify
        await onVerify(result.token)
      } else {
        // Prod mode: email sent, show check-email screen
        setStep('check-email')
      }
    } catch (err) {
      console.error('Login failed:', err)
    } finally {
      setSending(false)
    }
  }

  const handleResend = async () => {
    setSending(true)
    try {
      const result = await onLogin(email)
      if (result?.token) {
        await onVerify(result.token)
      }
    } catch (err) {
      console.error('Resend failed:', err)
    } finally {
      setSending(false)
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

        {step === 'email' && (
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
                disabled={loading || sending}
                style={{ color: '#000000', backgroundColor: '#FFFFFF', WebkitTextFillColor: '#000000' }}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || sending}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {(loading || sending) ? 'Sending...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'check-email' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="text-5xl mb-4">✉️</div>
            <h2 className="text-xl font-semibold text-text-primary">Check your email</h2>
            <p className="text-text-secondary">
              We sent a sign-in link to<br />
              <span className="text-text-primary font-medium">{email}</span>
            </p>
            <p className="text-text-tertiary text-sm">
              Click the link in the email to sign in. It expires in 15 minutes.
            </p>

            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="pt-4 space-y-2">
              <button
                onClick={handleResend}
                disabled={sending}
                className="w-full py-3 bg-surface border border-border text-text-primary rounded-xl font-medium hover:bg-surface/80 disabled:opacity-50 transition-colors"
              >
                {sending ? 'Sending...' : 'Resend email'}
              </button>
              <button
                onClick={() => setStep('email')}
                className="w-full py-2 text-text-secondary text-sm hover:text-text-primary transition-colors"
              >
                Use a different email
              </button>
              <button
                onClick={() => setStep('verify')}
                className="w-full py-2 text-text-tertiary text-xs hover:text-text-secondary transition-colors"
              >
                Enter code manually
              </button>
            </div>
          </motion.div>
        )}

        {step === 'verify' && (
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
                placeholder="Paste code from email"
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
              onClick={() => setStep('check-email')}
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
