import { motion } from 'framer-motion'
import { getPageVariants } from '../utils/animations'

function PageWrapper({ children, className = '' }) {
  const variants = getPageVariants()

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default PageWrapper
