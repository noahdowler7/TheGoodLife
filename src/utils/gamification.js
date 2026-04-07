import { format, subDays, startOfWeek, differenceInDays } from 'date-fns'

// ─── XP & Levels ───────────────────────────────────────────────────────────────

const XP_PER_LEVEL = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,   // 1-10
  4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000, // 11-20
  26000, 30500, 35500, 41000, 47000, 54000, 62000, 71000, 81000, 92000, // 21-30
]

export function getLevel(totalXP) {
  let level = 1
  for (let i = 1; i < XP_PER_LEVEL.length; i++) {
    if (totalXP >= XP_PER_LEVEL[i]) level = i + 1
    else break
  }
  return level
}

export function getLevelProgress(totalXP) {
  const level = getLevel(totalXP)
  const currentThreshold = XP_PER_LEVEL[level - 1] || 0
  const nextThreshold = XP_PER_LEVEL[level] || currentThreshold + 10000
  const progress = totalXP - currentThreshold
  const needed = nextThreshold - currentThreshold
  return { level, progress, needed, percent: Math.min(progress / needed, 1) }
}

// XP rewards for various actions
export const XP_REWARDS = {
  completeDiscipline: 10,
  completeAllCapital: 25,     // bonus: all disciplines in a capital
  completeAllDisciplines: 50, // bonus: every discipline done
  dailyQuestComplete: 15,
  allQuestsComplete: 50,      // chest bonus
  bibleReading: 15,
  prayer: 10,
  friendQuestComplete: 30,
  gameComplete: 20,
  streakMilestone7: 50,
  streakMilestone30: 150,
  streakMilestone100: 500,
  streakMilestone365: 2000,
}

// ─── Daily Quests ──────────────────────────────────────────────────────────────

const QUEST_TEMPLATES = [
  { type: 'complete_disciplines', label: 'Complete {target} disciplines', targets: [3, 5, 7, 10], icon: 'check' },
  { type: 'bible_reading', label: 'Read the Bible today', targets: [1], icon: 'book' },
  { type: 'prayer', label: 'Spend time in prayer', targets: [1], icon: 'pray' },
  { type: 'earn_xp', label: 'Earn {target} XP today', targets: [30, 50, 75, 100], icon: 'star' },
  { type: 'rate_capitals', label: 'Rate {target} capitals today', targets: [3, 5], icon: 'chart' },
  { type: 'complete_capital', label: 'Complete all disciplines in a capital', targets: [1], icon: 'crown' },
  { type: 'reflection', label: 'Write a reflection', targets: [1], icon: 'pen' },
  { type: 'streak_maintain', label: 'Maintain a streak', targets: [1], icon: 'fire' },
  { type: 'serve_others', label: 'Serve someone today', targets: [1], icon: 'heart' },
  { type: 'exercise', label: 'Get active today', targets: [1], icon: 'run' },
  { type: 'fellowship', label: 'Connect with community', targets: [1], icon: 'people' },
  { type: 'play_game', label: 'Play a scripture game', targets: [1], icon: 'game' },
]

// Deterministic daily quest selection based on date
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function generateDailyQuests(dateStr) {
  const seed = dateStr.split('-').reduce((acc, n) => acc * 31 + parseInt(n), 0)
  const shuffled = [...QUEST_TEMPLATES].sort((a, b) => seededRandom(seed + a.type.length) - seededRandom(seed + b.type.length))

  return shuffled.slice(0, 3).map((template, i) => {
    const target = template.targets[Math.floor(seededRandom(seed + i * 7) * template.targets.length)]
    return {
      id: `${dateStr}-${i}`,
      type: template.type,
      label: template.label.replace('{target}', target),
      icon: template.icon,
      target,
      progress: 0,
      completed: false,
      xpReward: XP_REWARDS.dailyQuestComplete,
    }
  })
}

// Check quest progress based on current app state
export function updateQuestProgress(quests, disciplines, ratings, reflections, todayStr, todayXP) {
  const dayData = disciplines[todayStr] || {}
  const dayRatings = ratings[todayStr] || {}
  const dayReflections = reflections[todayStr] || {}
  const completedDiscs = Object.keys(dayData).filter(k => dayData[k])
  const ratedCapitals = Object.keys(dayRatings).filter(k => dayRatings[k] > 0)
  const hasReflection = Object.values(dayReflections).some(v => {
    if (typeof v === 'string') return v.trim().length > 0
    if (Array.isArray(v)) return v.some(item => typeof item === 'string' && item.trim().length > 0)
    return !!v
  })

  return quests.map(q => {
    let progress = 0
    switch (q.type) {
      case 'complete_disciplines': progress = completedDiscs.length; break
      case 'bible_reading': progress = dayData['bible-reading'] ? 1 : 0; break
      case 'prayer': progress = dayData['prayer'] ? 1 : 0; break
      case 'earn_xp': progress = todayXP; break
      case 'rate_capitals': progress = ratedCapitals.length; break
      case 'complete_capital': progress = completedDiscs.length >= 4 ? 1 : 0; break
      case 'reflection': progress = hasReflection ? 1 : 0; break
      case 'streak_maintain': progress = completedDiscs.length > 0 ? 1 : 0; break
      case 'serve_others': progress = dayData['serving'] ? 1 : 0; break
      case 'exercise': progress = dayData['exercise'] ? 1 : 0; break
      case 'fellowship': progress = dayData['fellowship'] ? 1 : 0; break
      case 'play_game': progress = q.progress; break // tracked separately
      default: progress = q.progress
    }
    return { ...q, progress, completed: progress >= q.target }
  })
}

// ─── Achievements ──────────────────────────────────────────────────────────────

export const ACHIEVEMENTS = [
  // Streak milestones
  { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', icon: 'fire', category: 'streak', requirement: { type: 'streak', value: 7 } },
  { id: 'streak_30', name: 'Monthly Faithful', description: '30-day streak', icon: 'fire', category: 'streak', requirement: { type: 'streak', value: 30 } },
  { id: 'streak_100', name: 'Centurion', description: '100-day streak', icon: 'fire', category: 'streak', requirement: { type: 'streak', value: 100 } },
  { id: 'streak_365', name: 'Year of Faithfulness', description: '365-day streak', icon: 'crown', category: 'streak', requirement: { type: 'streak', value: 365 } },

  // XP milestones
  { id: 'xp_100', name: 'Getting Started', description: 'Earn 100 XP', icon: 'star', category: 'xp', requirement: { type: 'xp', value: 100 } },
  { id: 'xp_500', name: 'Growing Strong', description: 'Earn 500 XP', icon: 'star', category: 'xp', requirement: { type: 'xp', value: 500 } },
  { id: 'xp_1000', name: 'Kingdom Builder', description: 'Earn 1,000 XP', icon: 'star', category: 'xp', requirement: { type: 'xp', value: 1000 } },
  { id: 'xp_5000', name: 'Pillar of Faith', description: 'Earn 5,000 XP', icon: 'trophy', category: 'xp', requirement: { type: 'xp', value: 5000 } },
  { id: 'xp_10000', name: 'Mighty in Spirit', description: 'Earn 10,000 XP', icon: 'trophy', category: 'xp', requirement: { type: 'xp', value: 10000 } },

  // Discipline milestones
  { id: 'first_checkin', name: 'First Step', description: 'Complete your first discipline', icon: 'check', category: 'discipline', requirement: { type: 'totalDisciplines', value: 1 } },
  { id: 'disc_50', name: 'Consistent', description: 'Complete 50 disciplines', icon: 'check', category: 'discipline', requirement: { type: 'totalDisciplines', value: 50 } },
  { id: 'disc_200', name: 'Devoted', description: 'Complete 200 disciplines', icon: 'check', category: 'discipline', requirement: { type: 'totalDisciplines', value: 200 } },
  { id: 'disc_500', name: 'Steadfast', description: 'Complete 500 disciplines', icon: 'medal', category: 'discipline', requirement: { type: 'totalDisciplines', value: 500 } },

  // Perfect day
  { id: 'perfect_day', name: 'Perfect Day', description: 'Complete every discipline in one day', icon: 'crown', category: 'special', requirement: { type: 'perfectDay', value: 1 } },
  { id: 'all_quests', name: 'Quest Master', description: 'Complete all 3 daily quests', icon: 'chest', category: 'special', requirement: { type: 'allQuests', value: 1 } },

  // Social
  { id: 'first_partner', name: 'Accountability', description: 'Add an accountability partner', icon: 'people', category: 'social', requirement: { type: 'partners', value: 1 } },
  { id: 'friend_streak_7', name: 'Better Together', description: '7-day friend streak', icon: 'handshake', category: 'social', requirement: { type: 'friendStreak', value: 7 } },
  { id: 'friend_streak_30', name: 'Iron Sharpens Iron', description: '30-day friend streak', icon: 'handshake', category: 'social', requirement: { type: 'friendStreak', value: 30 } },

  // League
  { id: 'league_silver', name: 'Rising Up', description: 'Reach Silver league', icon: 'shield', category: 'league', requirement: { type: 'league', value: 'silver' } },
  { id: 'league_gold', name: 'Golden Faith', description: 'Reach Gold league', icon: 'shield', category: 'league', requirement: { type: 'league', value: 'gold' } },
  { id: 'league_diamond', name: 'Diamond Disciple', description: 'Reach Diamond league', icon: 'diamond', category: 'league', requirement: { type: 'league', value: 'diamond' } },

  // Games
  { id: 'first_game', name: 'Game On', description: 'Play your first scripture game', icon: 'game', category: 'games', requirement: { type: 'gamesPlayed', value: 1 } },
  { id: 'games_10', name: 'Scripture Scholar', description: 'Play 10 scripture games', icon: 'game', category: 'games', requirement: { type: 'gamesPlayed', value: 10 } },
]

export function checkAchievements(gamification, disciplines, partners) {
  const unlocked = gamification.achievements || []
  const unlockedIds = new Set(unlocked.map(a => a.id))
  const newlyUnlocked = []

  // Calculate total disciplines completed
  let totalDisciplines = 0
  Object.values(disciplines).forEach(dayData => {
    totalDisciplines += Object.values(dayData).filter(Boolean).length
  })

  // Get max streak
  const allIds = new Set()
  Object.values(disciplines).forEach(dayData => {
    Object.keys(dayData).forEach(id => { if (dayData[id]) allIds.add(id) })
  })

  // Get max friend streak
  const maxFriendStreak = Object.values(gamification.friendStreaks || {}).reduce((max, fs) => Math.max(max, fs.count || 0), 0)

  const LEAGUE_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond']

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue

    const req = achievement.requirement
    let met = false

    switch (req.type) {
      case 'streak': {
        // Check if any active streak meets the requirement
        allIds.forEach(id => {
          const streak = calculateSimpleStreak(id, disciplines)
          if (streak >= req.value) met = true
        })
        break
      }
      case 'xp': met = (gamification.xp || 0) >= req.value; break
      case 'totalDisciplines': met = totalDisciplines >= req.value; break
      case 'perfectDay': {
        // Check if any day had 100% completion (simplified: 10+ disciplines)
        met = Object.values(disciplines).some(dayData =>
          Object.values(dayData).filter(Boolean).length >= 10
        )
        break
      }
      case 'allQuests': met = gamification.questsAllCompleted > 0; break
      case 'partners': met = (partners?.length || 0) >= req.value; break
      case 'friendStreak': met = maxFriendStreak >= req.value; break
      case 'league': {
        const currentIdx = LEAGUE_ORDER.indexOf(gamification.league?.tier || 'bronze')
        const reqIdx = LEAGUE_ORDER.indexOf(req.value)
        met = currentIdx >= reqIdx
        break
      }
      case 'gamesPlayed': met = (gamification.gamesPlayed || 0) >= req.value; break
    }

    if (met) {
      newlyUnlocked.push({ id: achievement.id, unlockedAt: new Date().toISOString() })
    }
  }

  return newlyUnlocked
}

// Simple streak without grace days (for achievement checking)
function calculateSimpleStreak(disciplineId, disciplines) {
  let streak = 0
  let date = new Date()
  const todayStr = format(date, 'yyyy-MM-dd')
  if (!disciplines[todayStr]?.[disciplineId]) date = subDays(date, 1)

  for (let i = 0; i < 400; i++) {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (disciplines[dateStr]?.[disciplineId]) {
      streak++
      date = subDays(date, 1)
    } else break
  }
  return streak
}

// ─── Friend Streaks ────────────────────────────────────────────────────────────

export function calculateFriendStreak(partnerId, gamification) {
  return gamification.friendStreaks?.[partnerId] || { count: 0, lastBothActive: null }
}

// ─── Leagues ───────────────────────────────────────────────────────────────────

export const LEAGUE_TIERS = [
  { id: 'bronze', name: 'Bronze', color: '#CD7F32', icon: 'shield', minXP: 0 },
  { id: 'silver', name: 'Silver', color: '#C0C0C0', icon: 'shield', minXP: 0 },
  { id: 'gold', name: 'Gold', color: '#FFD700', icon: 'shield', minXP: 0 },
  { id: 'platinum', name: 'Platinum', color: '#E5E4E2', icon: 'shield', minXP: 0 },
  { id: 'diamond', name: 'Diamond', color: '#B9F2FF', icon: 'diamond', minXP: 0 },
]

// Generate simulated league participants for demo
export function generateLeagueParticipants(weekSeed, userName, userXP) {
  const names = [
    'Sarah M.', 'David K.', 'Grace L.', 'Michael T.', 'Hannah R.',
    'Joshua P.', 'Rachel W.', 'Daniel F.', 'Abigail S.', 'Caleb H.',
    'Esther N.', 'Samuel B.', 'Naomi C.', 'Elijah D.', 'Lydia G.',
    'Isaac J.', 'Ruth A.', 'Luke E.', 'Miriam V.', 'Aaron Q.',
    'Deborah Z.', 'Noah X.', 'Priscilla Y.', 'Ezra I.', 'Martha O.',
    'Silas U.', 'Rebecca R.', 'Jonah M.', 'Leah K.',
  ]

  const participants = names.map((name, i) => {
    const xp = Math.floor(seededRandom(weekSeed + i * 13) * 300) + 20
    return { name, xp, isUser: false }
  })

  participants.push({ name: userName || 'You', xp: userXP, isUser: true })
  participants.sort((a, b) => b.xp - a.xp)

  return participants.map((p, i) => ({ ...p, rank: i + 1 }))
}

// ─── Friend Quests ─────────────────────────────────────────────────────────────

const FRIEND_QUEST_TEMPLATES = [
  { type: 'read_together', label: 'Read the Bible together for {target} days', targets: [3, 5, 7] },
  { type: 'pray_together', label: 'Both pray for {target} days', targets: [3, 5] },
  { type: 'earn_xp_together', label: 'Earn {target} XP together', targets: [100, 200, 300] },
  { type: 'complete_disciplines', label: 'Complete {target} disciplines together', targets: [20, 30, 50] },
  { type: 'streak_together', label: 'Both maintain streaks for {target} days', targets: [5, 7] },
]

export function generateFriendQuest(partnerId, partnerName) {
  const seed = Date.now()
  const template = FRIEND_QUEST_TEMPLATES[Math.floor(seededRandom(seed) * FRIEND_QUEST_TEMPLATES.length)]
  const target = template.targets[Math.floor(seededRandom(seed + 1) * template.targets.length)]

  return {
    id: `fq-${Date.now()}`,
    partnerId,
    partnerName,
    type: template.type,
    label: template.label.replace('{target}', target),
    target,
    progress: 0,
    partnerProgress: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    completed: false,
    xpReward: XP_REWARDS.friendQuestComplete,
  }
}

// ─── Streak Freezes ────────────────────────────────────────────────────────────

export const STREAK_FREEZE_COST = 50 // XP cost for a streak freeze
export const MAX_STREAK_FREEZES = 3

export function canBuyStreakFreeze(gamification) {
  const freezes = gamification.streakFreezes || 0
  const xp = gamification.xp || 0
  return freezes < MAX_STREAK_FREEZES && xp >= STREAK_FREEZE_COST
}

// ─── Scripture Match Game Data ─────────────────────────────────────────────────

export const SCRIPTURE_PAIRS = [
  { verse: '"For God so loved the world..."', ref: 'John 3:16' },
  { verse: '"I can do all things through Christ..."', ref: 'Philippians 4:13' },
  { verse: '"The Lord is my shepherd..."', ref: 'Psalm 23:1' },
  { verse: '"Trust in the Lord with all your heart..."', ref: 'Proverbs 3:5' },
  { verse: '"Be strong and courageous..."', ref: 'Joshua 1:9' },
  { verse: '"For I know the plans I have for you..."', ref: 'Jeremiah 29:11' },
  { verse: '"The joy of the Lord is your strength..."', ref: 'Nehemiah 8:10' },
  { verse: '"Love is patient, love is kind..."', ref: '1 Corinthians 13:4' },
  { verse: '"Do not be anxious about anything..."', ref: 'Philippians 4:6' },
  { verse: '"In the beginning God created..."', ref: 'Genesis 1:1' },
  { verse: '"Seek first the kingdom of God..."', ref: 'Matthew 6:33' },
  { verse: '"Come to me, all who are weary..."', ref: 'Matthew 11:28' },
  { verse: '"I am the way, the truth, the life..."', ref: 'John 14:6' },
  { verse: '"Be still, and know that I am God..."', ref: 'Psalm 46:10' },
  { verse: '"He gives strength to the weary..."', ref: 'Isaiah 40:29' },
  { verse: '"Faith is the substance of things hoped for..."', ref: 'Hebrews 11:1' },
  { verse: '"Create in me a clean heart..."', ref: 'Psalm 51:10' },
  { verse: '"The Lord is near to the brokenhearted..."', ref: 'Psalm 34:18' },
  { verse: '"Iron sharpens iron..."', ref: 'Proverbs 27:17' },
  { verse: '"Walk by faith, not by sight..."', ref: '2 Corinthians 5:7' },
]

export function getGamePairs(count = 6) {
  const shuffled = [...SCRIPTURE_PAIRS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// ─── Default Gamification State ────────────────────────────────────────────────

export const DEFAULT_GAMIFICATION = {
  xp: 0,
  streakFreezes: 1, // start with 1 free freeze (grace!)
  dailyQuests: null, // generated on first load
  achievements: [],
  friendStreaks: {},
  league: {
    tier: 'bronze',
    weekStart: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    weeklyXP: 0,
  },
  friendQuests: [],
  gamesPlayed: 0,
  questsAllCompleted: 0,
  todayXP: 0,
  todayXPDate: format(new Date(), 'yyyy-MM-dd'),
}
