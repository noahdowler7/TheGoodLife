// Animation utilities for ClickUp-style UI/UX

// Check for reduced motion preference
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Page transition variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

// Reduced motion page variants
export const pageVariantsReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
}

// List container variants with stagger
export const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

// List item variants
export const listItemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

// Modal/Sheet spring animations
export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const sheetVariants = {
  hidden: {
    y: '100%',
    opacity: 0.5,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    y: '100%',
    opacity: 0.5,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

// Center modal variants
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
}

// Task completion burst animation
export const completionBurstVariants = {
  initial: { scale: 0, opacity: 1 },
  animate: {
    scale: [0, 1.2, 0],
    opacity: [1, 0.8, 0],
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

// Swipe gesture config
export const swipeConfig = {
  power: 0.3,
  timeConstant: 200,
  min: 0,
  max: 100,
}

// Swipe thresholds
export const SWIPE_THRESHOLD = 80

// Spring configurations for different use cases
export const springConfig = {
  snappy: { type: 'spring', stiffness: 400, damping: 30 },
  gentle: { type: 'spring', stiffness: 200, damping: 20 },
  bouncy: { type: 'spring', stiffness: 300, damping: 10 },
}

// Hover/tap animations
export const hoverTapVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

// Fade animation
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

// Skeleton shimmer animation
export const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  },
}

// Get appropriate variants based on reduced motion preference
export const getPageVariants = () => {
  return prefersReducedMotion() ? pageVariantsReduced : pageVariants
}

export const getListVariants = () => {
  if (prefersReducedMotion()) {
    return {
      container: { hidden: {}, visible: {} },
      item: fadeVariants,
    }
  }
  return {
    container: listContainerVariants,
    item: listItemVariants,
  }
}
