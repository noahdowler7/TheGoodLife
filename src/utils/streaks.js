import { format, subDays } from 'date-fns'
import { CAPITALS, getDisciplinesForCapital } from './capitals'

/**
 * Calculate the current streak for a specific discipline.
 * Walks backwards from today counting consecutive completed days.
 * Allows 1 grace day per 7-day window — rest is holy too.
 */
export function calculateStreak(disciplineId, disciplines) {
  let streak = 0
  let graceDaysUsed = 0
  const MAX_GRACE_PER_WEEK = 1
  let date = new Date()

  // Check today first
  const todayStr = format(date, 'yyyy-MM-dd')
  const todayData = disciplines[todayStr]
  if (!todayData || !todayData[disciplineId]) {
    // If not done today, start counting from yesterday
    date = subDays(date, 1)
  }

  while (true) {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayData = disciplines[dateStr]
    if (dayData && dayData[disciplineId]) {
      streak++
      date = subDays(date, 1)
    } else {
      // Grace day: allow 1 missed day per 7 consecutive days
      if (graceDaysUsed < MAX_GRACE_PER_WEEK && streak >= 2) {
        graceDaysUsed++
        date = subDays(date, 1)
        // Check if the day before the grace day was completed
        const nextDateStr = format(date, 'yyyy-MM-dd')
        const nextDayData = disciplines[nextDateStr]
        if (nextDayData && nextDayData[disciplineId]) {
          streak++ // count the day after the grace
          date = subDays(date, 1)
          // Reset grace counter every 7 days of streak
          if (streak % 7 === 0) graceDaysUsed = 0
          continue
        }
      }
      break
    }
  }

  return streak
}

/**
 * Calculate overall completion score for a capital on a given date.
 * Returns { completionRate, rating, completedCount, totalCount }
 */
export function calculateCapitalScore(capitalId, disciplines, ratings, date, customDisciplines = []) {
  const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')
  const dayDisciplines = disciplines[dateStr] || {}
  const dayRatings = ratings[dateStr] || {}

  const capitalDiscs = getDisciplinesForCapital(capitalId, customDisciplines)
  const totalCount = capitalDiscs.length
  const completedCount = capitalDiscs.filter(d => dayDisciplines[d.id]).length
  const completionRate = totalCount > 0 ? completedCount / totalCount : 0
  const rating = dayRatings[capitalId] || 0

  return { completionRate, rating, completedCount, totalCount }
}

/**
 * Get weekly completion rate for a capital across an array of date strings.
 */
export function getWeeklyCompletionRate(capitalId, disciplines, weekDates, customDisciplines = []) {
  if (weekDates.length === 0) return 0

  const capitalDiscs = getDisciplinesForCapital(capitalId, customDisciplines)
  if (capitalDiscs.length === 0) return 0

  let totalPossible = 0
  let totalCompleted = 0

  weekDates.forEach(dateStr => {
    const dayData = disciplines[dateStr] || {}
    capitalDiscs.forEach(d => {
      totalPossible++
      if (dayData[d.id]) totalCompleted++
    })
  })

  return totalPossible > 0 ? totalCompleted / totalPossible : 0
}

/**
 * Get the longest streak across all disciplines.
 */
export function getLongestActiveStreak(disciplines) {
  let longest = { disciplineId: null, count: 0 }

  // Check all disciplines that appear in any day's data
  const allIds = new Set()
  Object.values(disciplines).forEach(dayData => {
    Object.keys(dayData).forEach(id => {
      if (dayData[id]) allIds.add(id)
    })
  })

  allIds.forEach(id => {
    const streak = calculateStreak(id, disciplines)
    if (streak > longest.count) {
      longest = { disciplineId: id, count: streak }
    }
  })

  return longest
}

/**
 * Get all active streaks (count > 0) for display.
 */
export function getActiveStreaks(disciplines) {
  const allIds = new Set()
  Object.values(disciplines).forEach(dayData => {
    Object.keys(dayData).forEach(id => {
      if (dayData[id]) allIds.add(id)
    })
  })

  const streaks = []
  allIds.forEach(id => {
    const count = calculateStreak(id, disciplines)
    if (count > 0) {
      streaks.push({ disciplineId: id, count })
    }
  })

  return streaks.sort((a, b) => b.count - a.count)
}

/**
 * Get overall daily completion percentage across all capitals.
 */
export function getDailyCompletionRate(disciplines, date, capitalToggles, customDisciplines = []) {
  const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')
  const dayData = disciplines[dateStr] || {}

  let total = 0
  let completed = 0

  Object.keys(CAPITALS).forEach(capitalId => {
    if (capitalToggles && capitalToggles[capitalId] === false) return
    const discs = getDisciplinesForCapital(capitalId, customDisciplines)
    discs.forEach(d => {
      total++
      if (dayData[d.id]) completed++
    })
  })

  return total > 0 ? completed / total : 0
}
