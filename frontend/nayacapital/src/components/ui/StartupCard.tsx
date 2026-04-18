import React from 'react'
import { motion } from 'framer-motion'
import FundingBar from './FundingBar'
import SectorBadge from './SectorBadge'

type Variant = 'compact' | 'full'

interface Startup {
  id: string
  name: string
  tagline: string
  sector: string
  amount_raised?: number
  funding_goal?: number
  investor_count?: number
  min_investment?: number
}

interface StartupCardProps {
  startup: Startup
  onClick?: (id: string) => void
  variant?: Variant
  index?: number
}

const StartupCard: React.FC<StartupCardProps> = ({
  startup,
  onClick,
  variant = 'full',
  index = 0,
}) => {
  const fundingPercent = startup.amount_raised && startup.funding_goal
    ? (startup.amount_raised / startup.funding_goal) * 100
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      viewport={{ once: true, margin: '-100px' }}
      whileHover={{ scale: 1.02, y: -8 }}
      onClick={() => onClick?.(startup.id)}
      className={`
        bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300
        border border-surface-2
        ${onClick ? 'cursor-pointer' : ''}
        ${variant === 'compact' ? 'p-4' : 'p-6'}
      `}
    >
      {/* Top Sector Banner */}
      <div className="h-1.5 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full -mx-6 -mt-6 mb-4" />

      {/* Sector Badge & Header */}
      <div className="flex items-start justify-between mb-4">
        <SectorBadge sector={startup.sector} size="sm" />
      </div>

      {/* Startup Name & Tagline */}
      <h3 className="font-display text-xl font-bold text-ink-primary mb-2 line-clamp-1">
        {startup.name}
      </h3>
      <p className="text-sm text-ink-secondary mb-6 line-clamp-2 min-h-10">
        {startup.tagline}
      </p>

      {/* Funding Progress */}
      {variant === 'full' && startup.amount_raised !== undefined && startup.funding_goal !== undefined && (
        <div className="mb-6">
          <FundingBar
            raised={startup.amount_raised}
            goal={startup.funding_goal}
            size="md"
            showLabels
          />
        </div>
      )}

      {/* Stats Row */}
      {variant === 'full' && (
        <div className="flex items-center justify-between mb-6 text-xs text-ink-secondary space-x-2">
          <span>Rs {startup.amount_raised?.toLocaleString() || '0'} raised</span>
          <span>•</span>
          <span>{fundingPercent.toFixed(0)}% funded</span>
          <span>•</span>
          <span>{startup.investor_count || 0} investors</span>
        </div>
      )}

      {/* Minimum Investment & CTA */}
      <div className="flex items-center justify-between gap-3">
        {startup.min_investment && (
          <span className="text-xs px-3 py-1 rounded-full bg-gold-light text-gold-dark font-semibold whitespace-nowrap">
            From Rs {startup.min_investment}
          </span>
        )}
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-2 bg-brand-600 text-white text-sm rounded-lg font-semibold hover:bg-brand-700 transition-colors"
        >
          View & Invest →
        </motion.button>
      </div>
    </motion.div>
  )
}

export default StartupCard

