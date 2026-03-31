// Five Capitals — core data model for "The Good Life"
// Five Capitals from the Living the Good Life series — Movement Church

export const CAPITALS = {
  spiritual: {
    id: 'spiritual',
    name: 'Spiritual',
    color: '#D4A843',
    colorVar: 'var(--capital-spiritual)',
    icon: 'cross',
    disciplines: [
      { id: 'bible-reading', label: 'Bible Reading' },
      { id: 'prayer', label: 'Prayer' },
      { id: 'worship', label: 'Worship' },
      { id: 'fasting', label: 'Fasting' },
      { id: 'meditation', label: 'Meditation on Scripture' },
    ],
  },
  relational: {
    id: 'relational',
    name: 'Relational',
    color: '#E07B6A',
    colorVar: 'var(--capital-relational)',
    icon: 'heart',
    disciplines: [
      { id: 'serving', label: 'Serving Others' },
      { id: 'fellowship', label: 'Fellowship / Community' },
      { id: 'encouraging', label: 'Encouraging Someone' },
      { id: 'family-time', label: 'Family Time' },
    ],
  },
  physical: {
    id: 'physical',
    name: 'Physical',
    color: '#5BB98B',
    colorVar: 'var(--capital-physical)',
    icon: 'activity',
    disciplines: [
      { id: 'exercise', label: 'Exercise' },
      { id: 'rest-sleep', label: 'Rest / Sleep' },
      { id: 'healthy-eating', label: 'Healthy Eating' },
      { id: 'outdoor-time', label: 'Outdoor Time' },
    ],
  },
  intellectual: {
    id: 'intellectual',
    name: 'Intellectual',
    color: '#6B8DE3',
    colorVar: 'var(--capital-intellectual)',
    icon: 'book',
    disciplines: [
      { id: 'reading-study', label: 'Reading / Study' },
      { id: 'learning', label: 'Learning Something New' },
      { id: 'creative-work', label: 'Creative Work' },
      { id: 'planning', label: 'Planning / Strategy' },
    ],
  },
  financial: {
    id: 'financial',
    name: 'Financial',
    color: '#B07EE0',
    colorVar: 'var(--capital-financial)',
    icon: 'dollar',
    disciplines: [
      { id: 'giving-tithing', label: 'Giving / Tithing' },
      { id: 'budgeting', label: 'Budgeting' },
      { id: 'generosity', label: 'Generosity' },
      { id: 'saving', label: 'Saving' },
    ],
  },
}

export const CAPITAL_ORDER = ['spiritual', 'relational', 'physical', 'intellectual', 'financial']

// Flat list of all default disciplines with their capital reference
export const ALL_DISCIPLINES = CAPITAL_ORDER.flatMap(capitalId =>
  CAPITALS[capitalId].disciplines.map(d => ({
    ...d,
    capitalId,
  }))
)

// Get disciplines for a specific capital (including custom ones)
export function getDisciplinesForCapital(capitalId, customDisciplines = []) {
  const defaults = CAPITALS[capitalId]?.disciplines || []
  const custom = customDisciplines.filter(d => d.capitalId === capitalId)
  return [...defaults, ...custom]
}

// Get all active disciplines (respecting capital toggles + custom)
export function getActiveDisciplines(capitalToggles, customDisciplines = []) {
  return CAPITAL_ORDER
    .filter(id => capitalToggles[id] !== false)
    .flatMap(capitalId => getDisciplinesForCapital(capitalId, customDisciplines).map(d => ({
      ...d,
      capitalId,
    })))
}
