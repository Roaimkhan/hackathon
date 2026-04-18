import React from 'react'
import { motion } from 'framer-motion'

type Variant = 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'gray'
type Size = 'sm' | 'md'

interface BadgeProps {
  variant?: Variant
  size?: Size
  pulsing?: boolean
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<Variant, { bg: string; text: string; dot: string }> = {
  green: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  amber: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  red: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' },
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-xs font-semibold rounded-full',
  md: 'px-3 py-1.5 text-sm font-semibold rounded-full',
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  size = 'md',
  pulsing = false,
  children,
  className = '',
}) => {
  const styles = variantStyles[variant]

  return (
    <motion.div
      className={`
        flex items-center gap-2 w-fit
        ${styles.bg} ${styles.text}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {pulsing && (
        <motion.div
          className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <span>{children}</span>
    </motion.div>
  )
}

export default Badge
