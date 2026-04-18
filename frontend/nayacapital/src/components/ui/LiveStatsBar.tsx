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

interface StatCardProps {
  value: number
  label: string
  suffix?: string
}

const StatCard: React.FC<StatCardProps> = ({ value, label, suffix = '' }) => {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true })

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
    >
      <div className="text-5xl md:text-6xl font-mono font-bold text-gold mb-2">
        {inView ? (
          <SafeCountUp end={value} duration={2.5} suffix={suffix} />
        ) : (
          0
        )}
      </div>
      <div className="text-sm md:text-base text-ink-ghost font-medium">{label}</div>
    </motion.div>
  )
}

const LiveStatsBar: React.FC = () => {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true })

  const stats = [
    { value: 52000000, label: 'Total Invested', suffix: '+' },
    { value: 240, label: 'Active Startups', suffix: '' },
    { value: 3240, label: 'Investors', suffix: '+' },
    { value: 28, label: 'Avg Return', suffix: '%' },
  ]

  return (
    <motion.section
      ref={ref}
      initial={{ y: 40, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="w-full py-16 md:py-24 bg-brand-950"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => (
            <div key={idx} className={`flex justify-center ${idx > 0 ? 'border-l border-white/10 pl-8' : ''}`}>
              <StatCard value={stat.value} label={stat.label} suffix={stat.suffix} />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default LiveStatsBar
