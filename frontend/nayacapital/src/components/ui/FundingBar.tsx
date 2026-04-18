import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg'

interface FundingBarProps {
  raised: number
  goal: number
  showLabels?: boolean
  size?: Size
  animated?: boolean
}

const sizeStyles: Record<Size, { height: string; shadowBlur: string }> = {
  sm: { height: 'h-2', shadowBlur: '8px' },
  md: { height: 'h-3', shadowBlur: '10px' },
  lg: { height: 'h-4', shadowBlur: '12px' },
}

export const FundingBar: React.FC<FundingBarProps> = ({
  raised,
  goal,
  showLabels = true,
  size = 'md',
  animated = true,
}) => {
  const percent = Math.min((raised / goal) * 100, 100)
  const [displayPercent, setDisplayPercent] = useState(0)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayPercent(percent)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayPercent(percent)
    }
  }, [percent, animated])

  // Determine color based on percentage
  const getColor = () => {
    if (percent < 33) return 'bg-yellow-500'
    if (percent < 66) return 'bg-brand-500'
    return 'bg-brand-600'
  }

  const getShadowColor = () => {
    if (percent < 33) return 'rgba(234, 179, 8, 0.6)' // yellow
    if (percent < 66) return 'rgba(34, 197, 94, 0.6)' // brand-500
    return 'rgba(22, 163, 74, 0.6)' // brand-600
  }

  const styles = sizeStyles[size]

  return (
    <div className="space-y-2">
      <div className={`relative ${styles.height} rounded-full bg-surface-2 overflow-hidden`}>
        <motion.div
          initial={animated ? { width: '0%' } : { width: `${percent}%` }}
          animate={{ width: `${displayPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`${styles.height} rounded-full ${getColor()}`}
          style={{
            boxShadow:
              displayPercent > 0
                ? `0 0 ${styles.shadowBlur} ${getShadowColor()}`
                : 'none',
          }}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-ink-secondary font-medium">
            Rs {(raised / 1000).toFixed(0)}K raised
          </span>
          <span className="text-xs font-mono font-semibold text-brand-600">
            {displayPercent.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}

export default FundingBar
