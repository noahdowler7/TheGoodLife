import { motion } from 'framer-motion'
import MovementLogo from './MovementLogo'

export default function WelcomeScreen({ onGetStarted, onSignIn }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <MovementLogo width={180} className="mx-auto" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-3">
            The Good Life
          </h1>
          <p className="text-lg text-text-secondary">
            A Spiritual Operating System
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-text-tertiary mb-8 max-w-sm mx-auto"
        >
          Invest in what matters. Grow in the Five Capitals. Align your life with purpose.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <button
            onClick={onGetStarted}
            className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
          >
            Get Started
          </button>

          <button
            onClick={onSignIn}
            className="w-full py-4 bg-surface border-2 border-border text-text-primary rounded-xl font-medium hover:bg-background transition-all"
          >
            Sign In
          </button>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-xs text-text-tertiary"
        >
          Get started without signing in. Your data stays on your device.
        </motion.p>
      </motion.div>
    </div>
  )
}
