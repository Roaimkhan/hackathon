import React from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'

const resolveComponent = <T,>(component: T): T => {
  if (
    typeof component === 'object' &&
    component !== null &&
    'default' in (component as Record<string, unknown>)
  ) {
    return (component as unknown as { default: T }).default
  }
  return component
}

const SafeCountUp = resolveComponent(CountUp)

interface FundingProgressBarProps {
  fundingPercentage: number
  investorCount: number
}

const FundingProgressBar: React.FC<FundingProgressBarProps> = ({
  fundingPercentage,
  investorCount,
}) => {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true })

  return (
    <div ref={ref} className="space-y-2">
      <div className="relative h-3 bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${fundingPercentage}%` } : { width: 0 }}
          transition={{ type: 'spring', stiffness: 50, damping: 15, duration: 1 }}
          className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <motion.span
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          className="font-mono font-semibold text-brand-600"
        >
          {inView && <SafeCountUp end={fundingPercentage} suffix="%" />}
        </motion.span>
        <span className="text-ink-muted text-xs">
          {investorCount} investor{investorCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

export default FundingProgressBar
