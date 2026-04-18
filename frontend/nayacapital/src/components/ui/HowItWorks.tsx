import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { UserPlusIcon, SparklesIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

const HowItWorksCard: React.FC<{
  number: string
  title: string
  description: string
  icon: React.ComponentType<{ className: string }>
  delay: number
}> = ({ number, title, description, icon: Icon, delay }) => {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      whileHover={{ y: -8 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true, margin: '-100px' }}
      className="relative z-10 bg-surface-0 rounded-2xl p-8 border border-brand-100 shadow-lg hover:shadow-xl transition-shadow"
    >
      {/* Background Number */}
      <div className="absolute -top-6 -right-4 text-8xl font-display font-bold text-brand-100 opacity-20 pointer-events-none">
        {number}
      </div>

      {/* Icon */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="w-16 h-16 rounded-xl bg-brand-50 flex items-center justify-center mb-6"
      >
        <Icon className="w-8 h-8 text-brand-600" />
      </motion.div>

      {/* Content */}
      <h3 className="text-2xl font-display font-bold text-ink-primary mb-3">{title}</h3>
      <p className="text-ink-secondary leading-relaxed">{description}</p>
    </motion.div>
  )
}

const HowItWorks: React.FC = () => {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  const steps = [
    {
      number: '01',
      title: 'Create Account & KYC',
      description: 'Sign up with your email and complete simple KYC verification. Start investing in minutes without a bank account.',
      icon: UserPlusIcon,
    },
    {
      number: '02',
      title: 'Browse Verified Startups',
      description: 'Explore curated startups across diverse sectors. Each listing shows detailed metrics, founder info, and funding stage.',
      icon: SparklesIcon,
    },
    {
      number: '03',
      title: 'Track & Grow Equity',
      description: 'Monitor your portfolio in real-time. Receive milestone updates and dividend notifications directly to your account.',
      icon: ArrowTrendingUpIcon,
    },
  ]

  return (
    <section ref={ref} className="relative py-20 md:py-32 bg-surface-1 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-ink-primary mb-4">
            How It Works
          </h2>
          <p className="text-ink-secondary text-lg max-w-2xl mx-auto">
            Three simple steps to become a startup investor and build wealth together.
          </p>
        </motion.div>

        {/* Timeline with Cards */}
        <div className="relative">
          {/* Dotted Line */}
          <div className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent opacity-50 hidden lg:block" />

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {steps.map((step, idx) => (
              <HowItWorksCard
                key={idx}
                number={step.number}
                title={step.title}
                description={step.description}
                icon={step.icon}
                delay={idx * 0.2}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
