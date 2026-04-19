import React from 'react'
import { motion } from 'framer-motion'

interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    mobile?: number // default 1
    sm?: number     // default 2
    lg?: number     // default 3
    xl?: number     // default 4
  }
  gap?: string // default 'gap-4'
  stagger?: boolean // stagger animation on children
}

/**
 * ResponsiveGrid: Responsive card grid with Tailwind
 * Default: 1 col mobile, 2 cols tablet, 3 cols desktop, 4 cols large
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { mobile: 1, sm: 2, lg: 3, xl: 4 },
  gap = 'gap-4',
  stagger = false,
}) => {
  // Build className based on col settings
  const gridClass = `grid ${gap}
    grid-cols-${cols.mobile || 1}
    sm:grid-cols-${cols.sm || 2}
    lg:grid-cols-${cols.lg || 3}
    xl:grid-cols-${cols.xl || 4}
  `.replace(/\s+/g, ' ')

  if (!stagger) {
    return <div className={gridClass}>{children}</div>
  }

  // With stagger animation
  return (
    <motion.div
      className={gridClass}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

export default ResponsiveGrid
