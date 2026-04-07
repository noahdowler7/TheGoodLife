import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, startOfWeek } from 'date-fns'
import { LEAGUE_TIERS, generateLeagueParticipants } from '../utils/gamification'

function LeagueBoard({ gamification, settings }) {
  const currentTier = gamification.league?.tier || 'bronze'
  const tierInfo = LEAGUE_TIERS.find(t => t.id === currentTier) || LEAGUE_TIERS[0]
  const tierIndex = LEAGUE_TIERS.findIndex(t => t.id === currentTier)

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekSeed = weekStart.split('-').reduce((acc, n) => acc * 31 + parseInt(n), 0)

  const weeklyXP = gamification.league?.weekStart === weekStart
    ? (gamification.league?.weeklyXP || 0) : 0

  const participants = useMemo(
    () => generateLeagueParticipants(weekSeed, settings?.currentUser?.name, weeklyXP),
    [weekSeed, settings?.currentUser?.name, weeklyXP]
  )

  const userRank = participants.find(p => p.isUser)?.rank || 0
  const promotionZone = 10 // top 10 promote
  const relegationZone = 25 // bottom 5 relegate

  return (
    <div className="space-y-4">
      {/* League tier display */}
      <div className="rounded-2xl p-5 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          {LEAGUE_TIERS.map((tier, i) => (
            <div
              key={tier.id}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold"
              style={{
                background: i === tierIndex ? `${tier.color}30` : 'var(--bg-tertiary)',
                color: i === tierIndex ? tier.color : 'var(--text-muted)',
                border: i === tierIndex ? `2px solid ${tier.color}` : '2px solid transparent',
              }}
            >
              {tier.name[0]}
            </div>
          ))}
        </div>
        <h3 className="text-[20px] font-semibold mb-1" style={{ color: tierInfo.color, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
          {tierInfo.name} League
        </h3>
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          Top {promotionZone} advance next week
        </p>
      </div>

      {/* Your stats */}
      <div className="rounded-2xl p-4 flex items-center justify-between" style={{
        background: 'rgba(212, 168, 67, 0.08)',
        border: '1px solid rgba(212, 168, 67, 0.2)',
      }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{
            background: settings?.profilePicture ? 'transparent' : 'rgba(212, 168, 67, 0.2)',
            border: '2px solid #D4A843',
          }}>
            {settings?.profilePicture ? (
              <img src={settings.profilePicture} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[14px] font-bold" style={{ color: '#D4A843' }}>
                {(settings?.currentUser?.name || 'Y')[0]}
              </span>
            )}
          </div>
          <div>
            <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              #{userRank} — {settings?.currentUser?.name || 'You'}
            </p>
            <p className="text-[12px]" style={{ color: '#D4A843' }}>{weeklyXP} XP this week</p>
          </div>
        </div>
        {userRank <= promotionZone && (
          <span className="text-[11px] font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(91, 185, 139, 0.15)', color: '#5BB98B' }}>
            Promotion zone
          </span>
        )}
      </div>

      {/* Leaderboard */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {participants.map((p, i) => {
          const isPromotion = p.rank <= promotionZone
          const isRelegation = p.rank >= relegationZone

          return (
            <motion.div
              key={p.name + p.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: p.isUser ? 'rgba(212, 168, 67, 0.06)' : 'transparent',
                borderBottom: i < participants.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              {/* Rank */}
              <span className="w-8 text-center text-[14px] font-semibold" style={{
                color: p.rank <= 3
                  ? ['#FFD700', '#C0C0C0', '#CD7F32'][p.rank - 1]
                  : 'var(--text-muted)'
              }}>
                {p.rank <= 3 ? (
                  <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="currentColor"
                    style={{ color: ['#FFD700', '#C0C0C0', '#CD7F32'][p.rank - 1] }}>
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
                  </svg>
                ) : p.rank}
              </span>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                background: p.isUser && settings?.profilePicture ? 'transparent' :
                  isPromotion ? 'rgba(91, 185, 139, 0.15)' :
                    isRelegation ? 'rgba(224, 123, 106, 0.15)' :
                      'var(--bg-tertiary)',
                overflow: 'hidden',
              }}>
                {p.isUser && settings?.profilePicture ? (
                  <img src={settings.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[12px] font-semibold" style={{
                    color: isPromotion ? '#5BB98B' : isRelegation ? '#E07B6A' : 'var(--text-muted)'
                  }}>
                    {p.name[0]}
                  </span>
                )}
              </div>

              {/* Name */}
              <span className="flex-1 text-[14px] font-medium" style={{
                color: p.isUser ? '#D4A843' : 'var(--text-primary)'
              }}>
                {p.name}{p.isUser ? ' (you)' : ''}
              </span>

              {/* XP */}
              <span className="text-[13px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                {p.xp} XP
              </span>

              {/* Zone indicator */}
              {isPromotion && (
                <div className="w-2 h-2 rounded-full" style={{ background: '#5BB98B' }} />
              )}
              {isRelegation && (
                <div className="w-2 h-2 rounded-full" style={{ background: '#E07B6A' }} />
              )}
            </motion.div>
          )
        })}
      </div>

      <p className="text-[11px] text-center px-4" style={{ color: 'var(--text-muted)' }}>
        Leagues reset every Monday. Earn XP by completing disciplines, quests, and games.
      </p>
    </div>
  )
}

export default LeagueBoard
