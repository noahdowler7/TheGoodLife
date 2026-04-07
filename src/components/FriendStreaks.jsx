import { useState } from 'react'
import { motion } from 'framer-motion'
import { generateFriendQuest, STREAK_FREEZE_COST, MAX_STREAK_FREEZES, canBuyStreakFreeze } from '../utils/gamification'

function FriendStreaks({ gamification, setGamification, partners }) {
  const [showFreezeShop, setShowFreezeShop] = useState(false)
  const friendStreaks = gamification.friendStreaks || {}
  const friendQuests = gamification.friendQuests || []

  const buyStreakFreeze = () => {
    if (!canBuyStreakFreeze(gamification)) return
    setGamification(prev => ({
      ...prev,
      xp: (prev.xp || 0) - STREAK_FREEZE_COST,
      streakFreezes: (prev.streakFreezes || 0) + 1,
    }))
  }

  const startFriendQuest = (partner) => {
    const quest = generateFriendQuest(partner.id, partner.name)
    setGamification(prev => ({
      ...prev,
      friendQuests: [...(prev.friendQuests || []), quest],
    }))
  }

  const removeFriendQuest = (questId) => {
    setGamification(prev => ({
      ...prev,
      friendQuests: (prev.friendQuests || []).filter(q => q.id !== questId),
    }))
  }

  // Demo: simulate friend streaks for existing partners
  const partnerStreaks = (partners || []).map(p => ({
    ...p,
    streak: friendStreaks[p.id] || { count: Math.floor(Math.random() * 15), lastBothActive: new Date().toISOString().slice(0, 10) },
  }))

  return (
    <div className="space-y-5">
      {/* Streak Freezes */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" style={{ color: '#6BB5FF' }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Grace Freezes</h3>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: MAX_STREAK_FREEZES }).map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{
                  background: i < (gamification.streakFreezes || 0) ? 'rgba(107, 181, 255, 0.2)' : 'var(--bg-tertiary)',
                }}
              >
                <svg className="w-3.5 h-3.5" style={{ color: i < (gamification.streakFreezes || 0) ? '#6BB5FF' : 'var(--text-muted)' }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[13px] mb-3" style={{ color: 'var(--text-secondary)' }}>
          Protect your streak on days you can't check in. Even God rested on the seventh day!
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={buyStreakFreeze}
          disabled={!canBuyStreakFreeze(gamification)}
          className="w-full py-2.5 rounded-xl text-[13px] font-semibold"
          style={{
            background: canBuyStreakFreeze(gamification) ? 'rgba(107, 181, 255, 0.15)' : 'var(--bg-tertiary)',
            color: canBuyStreakFreeze(gamification) ? '#6BB5FF' : 'var(--text-muted)',
            border: `1px solid ${canBuyStreakFreeze(gamification) ? 'rgba(107, 181, 255, 0.3)' : 'var(--border)'}`,
          }}
        >
          Buy Freeze — {STREAK_FREEZE_COST} XP
        </motion.button>
      </div>

      {/* Friend Streaks */}
      <div>
        <h3 className="text-[15px] font-semibold uppercase mb-3 px-1" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
          Friend Streaks
        </h3>

        {partnerStreaks.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              No partners yet
            </p>
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              Add accountability partners in Settings to start friend streaks!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {partnerStreaks.map(partner => (
              <motion.div
                key={partner.id}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${partner.color || '#D4A843'}20` }}>
                  <span className="text-[16px] font-semibold" style={{ color: partner.color || '#D4A843' }}>
                    {(partner.name || '?')[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {partner.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <svg className="w-3.5 h-3.5" style={{ color: partner.streak.count > 0 ? '#E8873D' : 'var(--text-muted)' }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 23a7.5 7.5 0 01-5.138-12.963C8.204 8.774 11.5 6.5 11 1.5c6 4 9 8 3 14 1 0 2.5 0 5-2.47.27.68.5 1.47.5 2.47 0 4.142-3.358 7.5-7.5 7.5z" />
                    </svg>
                    <span className="text-[12px] font-semibold" style={{ color: partner.streak.count > 0 ? '#E8873D' : 'var(--text-muted)' }}>
                      {partner.streak.count} day{partner.streak.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                {!friendQuests.find(q => q.partnerId === partner.id) && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startFriendQuest(partner)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-semibold"
                    style={{ background: 'rgba(212, 168, 67, 0.15)', color: '#D4A843' }}
                  >
                    Start Quest
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Active Friend Quests */}
      {friendQuests.length > 0 && (
        <div>
          <h3 className="text-[15px] font-semibold uppercase mb-3 px-1" style={{ color: 'var(--text-muted)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em' }}>
            Friend Quests
          </h3>
          <div className="space-y-2">
            {friendQuests.map(quest => {
              const daysLeft = Math.max(0, Math.ceil((new Date(quest.expiresAt) - new Date()) / 86400000))
              return (
                <div key={quest.id} className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {quest.label}
                    </p>
                    <button onClick={() => removeFriendQuest(quest.id)} className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      Cancel
                    </button>
                  </div>
                  <p className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                    With {quest.partnerName} — {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span style={{ color: 'var(--text-muted)' }}>You</span>
                        <span style={{ color: '#D4A843' }}>{quest.progress}/{quest.target}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="h-full rounded-full" style={{ background: '#D4A843', width: `${(quest.progress / quest.target) * 100}%` }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span style={{ color: 'var(--text-muted)' }}>{quest.partnerName}</span>
                        <span style={{ color: '#6B8DE3' }}>{quest.partnerProgress}/{quest.target}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="h-full rounded-full" style={{ background: '#6B8DE3', width: `${(quest.partnerProgress / quest.target) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] mt-2 font-semibold" style={{ color: '#D4A843' }}>+{quest.xpReward} XP on completion</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default FriendStreaks
