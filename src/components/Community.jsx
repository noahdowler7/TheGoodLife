import { useState, Component } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from './PageWrapper'
import XPBar from './XPBar'
import DailyQuests from './DailyQuests'
import LeagueBoard from './LeagueBoard'
import FriendStreaks from './FriendStreaks'
import Achievements from './Achievements'
import ScriptureMatchGame from './ScriptureMatchGame'
import { XP_REWARDS } from '../utils/gamification'

// Error boundary so a crashing child can't take down the whole page
class SafeRender extends Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Could not load this section
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-[12px] mt-2 underline"
            style={{ color: 'var(--accent)' }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const TABS = [
  { id: 'quests', label: 'Quests' },
  { id: 'league', label: 'League' },
  { id: 'friends', label: 'Friends' },
  { id: 'games', label: 'Games' },
  { id: 'badges', label: 'Badges' },
]

function Community({ disciplines, ratings, reflections, partners, settings, gamification, setGamification }) {
  const [activeTab, setActiveTab] = useState('quests')
  const [showGame, setShowGame] = useState(false)
  const gam = gamification || {}

  if (showGame) {
    return (
      <SafeRender>
        <ScriptureMatchGame
          gamification={gam}
          setGamification={setGamification}
          onClose={() => setShowGame(false)}
        />
      </SafeRender>
    )
  }

  return (
    <PageWrapper className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-2">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-[28px] font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>
            Community
          </h1>
          <SafeRender>
            <XPBar gamification={gam} />
          </SafeRender>
        </motion.div>
      </header>

      {/* Tabs */}
      <div className="px-5 mt-4 mb-4">
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--bg-secondary)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 rounded-xl text-[12px] font-semibold"
              style={{
                background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SafeRender>
              {activeTab === 'quests' && (
                <DailyQuests
                  gamification={gam}
                  setGamification={setGamification}
                  disciplines={disciplines || {}}
                  ratings={ratings || {}}
                  reflections={reflections || {}}
                />
              )}

              {activeTab === 'league' && (
                <LeagueBoard gamification={gam} settings={settings || {}} />
              )}

              {activeTab === 'friends' && (
                <FriendStreaks
                  gamification={gam}
                  setGamification={setGamification}
                  partners={partners || []}
                />
              )}

              {activeTab === 'games' && (
                <div className="space-y-4">
                  <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(212, 168, 67, 0.15)' }}>
                      <svg className="w-8 h-8" style={{ color: '#D4A843' }} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                      </svg>
                    </div>
                    <h3 className="text-[18px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Scripture Match
                    </h3>
                    <p className="text-[14px] mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Match Bible verses with their references. Test your knowledge and earn XP!
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-[18px] font-bold" style={{ color: '#D4A843' }}>{gam.gamesPlayed || 0}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Games played</p>
                      </div>
                      <div className="w-px h-8" style={{ background: 'var(--border)' }} />
                      <div className="text-center">
                        <p className="text-[18px] font-bold" style={{ color: '#5BB98B' }}>+{XP_REWARDS.gameComplete}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>XP per game</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowGame(true)}
                      className="px-8 py-3 rounded-2xl text-[15px] font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #D4A843, #E8C76A)' }}
                    >
                      Play Now
                    </motion.button>
                  </div>

                  <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)' }}>
                    <p className="text-[14px] font-medium" style={{ color: 'var(--text-muted)' }}>
                      More games coming soon!
                    </p>
                    <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      Verse completion, Bible trivia, and more
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'badges' && (
                <Achievements gamification={gam} />
              )}
            </SafeRender>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="h-4" />
    </PageWrapper>
  )
}

export default Community
