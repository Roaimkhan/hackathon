import React from 'react'
import { motion } from 'framer-motion'

interface StepCardProps {
  number: string
  icon: React.ReactNode
  title: string
  description: string
  index: number
}

const StepCard: React.FC<StepCardProps> = ({ number, icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
      viewport={{ once: true, margin: '-100px' }}
      whileHover={{ y: -8 }}
      className="relative"
    >
      {/* Large number background */}
      <div className="absolute -top-8 -left-4 text-8xl font-bold text-brand-100 opacity-30 pointer-events-none">
        {number}
      </div>

      {/* Card */}
      <div className="relative z-10 bg-surface-0 rounded-2xl p-8 shadow-lg border border-brand-100 transition-all duration-300 hover:shadow-xl">
        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.2, rotate: 10 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="w-16 h-16 rounded-xl bg-brand-100 flex items-center justify-center mb-4 text-brand-600"
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3 className="font-display text-2xl font-bold text-ink-primary mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-ink-secondary leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

export default StepCard
