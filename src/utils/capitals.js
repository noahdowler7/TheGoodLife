// Five Capitals — core data model for "The Good Life"
// Five Capitals from the Living the Good Life series — Movement Church

export const CAPITALS = {
  spiritual: {
    id: 'spiritual',
    name: 'Spiritual',
    color: '#D4A843',
    colorVar: 'var(--capital-spiritual)',
    icon: 'cross',
    description: 'Your relationship with God — the foundation of everything.',
    whyItMatters: 'When your spiritual life is strong, everything else finds its proper place. This is the wellspring from which all other growth flows. Invest here first, and watch how it transforms every other area.',
    verse: '"Seek first the kingdom of God and his righteousness, and all these things will be added to you." — Matthew 6:33',
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
    description: 'Your connections with family, friends, and community.',
    whyItMatters: 'We were created for relationship. The quality of your connections directly impacts your joy, resilience, and sense of purpose. Invest in people, and you invest in what lasts forever.',
    verse: '"A new command I give you: Love one another. As I have loved you, so you must love one another." — John 13:34',
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
    description: 'Your body — the temple where God dwells.',
    whyItMatters: 'Your physical health enables you to serve, lead, and love well. When you care for your body, you honor the One who created it. Invest in your physical health to sustain your calling.',
    verse: '"Do you not know that your bodies are temples of the Holy Spirit, who is in you?" — 1 Corinthians 6:19',
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
    description: 'Your mind, creativity, and continuous growth.',
    whyItMatters: 'God gave you a mind to steward. When you invest in learning, thinking deeply, and creating, you expand your capacity to impact the world. Grow your mind, grow your influence.',
    verse: '"Do not conform to the pattern of this world, but be transformed by the renewing of your mind." — Romans 12:2',
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
    description: 'Your resources and how you steward them for Kingdom impact.',
    whyItMatters: 'Money is a tool, not a goal. When you manage your finances with wisdom and generosity, you create margin for what matters most. Align your resources with your values.',
    verse: '"For where your treasure is, there your heart will be also." — Matthew 6:21',
    disciplines: [
      { id: 'stewardship', label: 'Financial Stewardship' },
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
