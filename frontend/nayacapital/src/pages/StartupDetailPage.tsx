import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { FundingBar } from '../components/ui/FundingBar'
import { MilestoneTimeline } from '../components/ui/MilestoneTimeline'
import { EquityCalculator } from '../components/ui/EquityCalculator'
import { useStartup, useInvest, useRealtimeFundingUpdates } from '../hooks'

interface Startup {
  id: string
  name: string
  tagline: string
  sector: string
  founder_name?: string
  founder_avatar?: string
  amount_raised: number
  funding_goal: number
  investors_count?: number
  investor_count?: number
  equity_offered: number
  status: 'active' | 'funded' | 'closing-soon' | string
  story?: string
  team_size?: number
  min_investment?: number
}

interface Milestone {
  id: string
  title: string
  description: string
  unlocksPercent: number
  status: 'completed' | 'in-progress' | 'upcoming'
  dueDate: string
}

const MILESTONES: Milestone[] = [
  {
    id: '1',
    title: 'Launch Mobile App',
    description: 'Release iOS/Android app for farmers to access real-time crop insights',
    unlocksPercent: 20,
    status: 'completed',
    dueDate: 'Q1 2024',
  },
  {
    id: '2',
    title: 'Expand to 10,000 Farms',
    description: 'Scale operations to 10,000 connected farms across Pakistan',
    unlocksPercent: 30,
    status: 'in-progress',
    dueDate: 'Q2 2024',
  },
  {
    id: '3',
    title: 'Launch Farmer Marketplace',
    description: 'Direct buyer-seller connection platform to eliminate middlemen',
    unlocksPercent: 25,
    status: 'upcoming',
    dueDate: 'Q3 2024',
  },
  {
    id: '4',
    title: 'Series A Fundraise',
    description: 'Raise Series A to expand nationally and internationally',
    unlocksPercent: 25,
    status: 'upcoming',
    dueDate: 'Q4 2024',
  },
]

const RECENT_INVESTORS = [
  { initials: 'FK', name: 'F.K.', amount: 500000, time: '2 hours ago' },
  { initials: 'SR', name: 'S.R.', amount: 250000, time: '4 hours ago' },
  { initials: 'MK', name: 'M.K.', amount: 150000, time: '6 hours ago' },
  { initials: 'AZ', name: 'A.Z.', amount: 300000, time: '1 day ago' },
  { initials: 'HM', name: 'H.M.', amount: 100000, time: '1 day ago' },
]

type TabType = 'story' | 'pitch' | 'team'

const StartupDetailPage: React.FC = () => {
  const { id } = useParams()
  const { startup, loading, error, refetch } = useStartup(id || '')
  const { invest, loading: isInvesting } = useInvest()
  
  const [activeTab, setActiveTab] = useState<TabType>('story')
  const [investmentAmount, setInvestmentAmount] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [investSuccess, setInvestSuccess] = useState(false)
  const [displayedAmount, setDisplayedAmount] = useState(0)

  // Real-time funding updates
  useRealtimeFundingUpdates(
    id || '',
    (newAmount, oldAmount) => {
      setDisplayedAmount(newAmount)
      const difference = newAmount - oldAmount
      const formattedAmount = (difference / 1000).toFixed(0)
      toast.success(`🔥 Someone just invested Rs ${formattedAmount}K!`, { icon: '🚀' })
    }
  )

  // Initialize displayed amount when startup loads
  useEffect(() => {
    if (startup?.amount_raised) {
      setDisplayedAmount(startup.amount_raised)
    }
  }, [startup])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 pt-24 pb-20 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto"
          />
          <p className="text-ink-secondary">Loading startup details...</p>
        </div>
      </div>
    )
  }

  if (error || !startup) {
    return (
      <div className="min-h-screen bg-surface-0 pt-24 pb-20 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-red-600 font-semibold">Failed to load startup</p>
          <motion.button
            onClick={() => refetch()}
            whileHover={{ scale: 1.05 }}
            className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    )
  }

  const handleInvest = async () => {
    const result = await invest(startup.id, investmentAmount)
    if (result) {
      setInvestSuccess(true)
      setTimeout(() => {
        setShowConfirm(false)
        setInvestSuccess(false)
        setInvestmentAmount(0)
        refetch() // Refresh startup data
      }, 2500)
    }
  }

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  const timelineMilestones: Milestone[] =
    (startup as any).milestones?.length
      ? (startup as any).milestones.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          unlocksPercent: m.fund_percentage,
          status:
            m.status === 'approved'
              ? 'completed'
              : m.status === 'submitted'
                ? 'in-progress'
                : 'upcoming',
          dueDate: `Step ${m.order_index || 1}`,
        }))
      : MILESTONES

  const equityPercentage = (investmentAmount / startup.funding_goal) * startup.equity_offered

  return (
    <div className="min-h-screen bg-surface-0 pt-24 pb-20">
      {/* Mobile: Investment Widget First */}
      <div className="lg:hidden max-w-7xl mx-auto px-6 mb-8">
        <InvestmentWidget
          startup={startup}
          investmentAmount={investmentAmount}
          onAmountChange={setInvestmentAmount}
          onInvest={() => setShowConfirm(true)}
          displayedAmount={displayedAmount}
        />
      </div>

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-[1fr_400px] gap-12">
        {/* LEFT COLUMN */}
        <div className="space-y-16">
          {/* Header Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Startup Name */}
            <h1 className="font-playfair text-6xl font-bold text-ink-primary mb-4">
              {startup.name}
            </h1>

            {/* Status Pills */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span
                className="px-4 py-2 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: '#10b981' }}
              >
                {startup.sector === 'Agri' || startup.sector === 'agritech' ? '🌱 AgriTech' : startup.sector}
              </span>
              <span className={`px-4 py-2 rounded-full text-xs font-semibold ${
                startup.status === 'active'
                  ? 'bg-brand-100 text-brand-700'
                  : startup.status === 'closing-soon'
                    ? 'bg-gold-100 text-gold-900'
                    : 'bg-brand-50 text-brand-700'
              }`}>
                {startup.status === 'active' ? '🟢 Active' : startup.status === 'closing-soon' ? '⏰ Closing Soon' : '✅ Funded'}
              </span>
            </div>

            {/* Founder Info */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{startup.founder_avatar || startup.name.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ink-secondary font-medium">By {startup.founder_name || 'Founder'}</span>
                <span className="px-2 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheckIcon className="w-3 h-3" />
                  Verified Founder
                </span>
              </div>
            </div>

            {/* Tagline */}
            <p className="font-dm-sans text-xl italic text-ink-secondary">
              {startup.tagline}
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Tab Buttons */}
            <div className="flex gap-0 border-b border-surface-3 mb-8 relative">
              {(['story', 'pitch', 'team'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium relative transition-colors ${
                    activeTab === tab ? 'text-brand-600' : 'text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {tab === 'story' ? 'Story' : tab === 'pitch' ? 'Pitch Deck' : 'Team'}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'story' && (
                <motion.div
                  key="story"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-4 text-ink-secondary leading-relaxed"
                >
                  {(startup.story || '').split('\n').filter(Boolean).map((paragraph: string, i: number) => (
                    <p key={i} className="text-base">
                      {paragraph}
                    </p>
                  ))}
                </motion.div>
              )}

              {activeTab === 'pitch' && (
                <motion.div
                  key="pitch"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  <div className="p-8 rounded-xl border-2 border-dashed border-surface-3 bg-surface-1 flex flex-col items-center justify-center h-96">
                    <SparklesIcon className="w-12 h-12 text-ink-muted mb-4" />
                    <p className="text-ink-secondary text-center mb-4">
                      Pitch deck not yet uploaded
                    </p>
                    <motion.a
                      href="/startups"
                      whileHover={{ scale: 1.05 }}
                      className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Download Sample Pitch Deck
                    </motion.a>
                  </div>
                </motion.div>
              )}

              {activeTab === 'team' && (
                <motion.div
                  key="team"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-4 rounded-xl border border-surface-3 hover:border-brand-200 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{String.fromCharCode(65 + i)}{String.fromCharCode(66 + i)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-ink-primary">Team Member {i + 1}</p>
                            <p className="text-xs text-ink-secondary">Role & Experience</p>
                          </div>
                        </div>
                        <p className="text-sm text-ink-secondary">
                          {i + 5}+ years of experience in tech and agriculture
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <MilestoneTimeline milestones={timelineMilestones} />
          </motion.div>

          {/* Recent Investors */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-playfair text-3xl font-bold text-ink-primary mb-2">
                {(startup.investor_count || 0)} people are backing this
              </h2>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-600 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600" />
                </span>
                <p className="text-sm text-ink-secondary">Live</p>
              </div>
            </div>

            {/* Avatar Stack */}
            <div className="flex -space-x-2">
              {RECENT_INVESTORS.slice(0, 5).map((investor, i) => (
                <motion.div
                  key={investor.initials}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center border-2 border-white text-xs font-bold text-white"
                >
                  {investor.initials}
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="space-y-3">
              {RECENT_INVESTORS.map((investor, i) => (
                <motion.div
                  key={investor.initials}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-ink-secondary">
                    <span className="font-semibold text-ink-primary">{investor.name}</span> invested Rs{' '}
                    <span className="font-mono font-semibold text-brand-600">
                      {(investor.amount / 100000).toFixed(1)}L
                    </span>
                  </span>
                  <span className="text-ink-ghost text-xs">{investor.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN - STICKY WIDGET */}
        <div className="hidden lg:block lg:sticky lg:top-28 h-fit">
          <InvestmentWidget
            startup={startup}
            investmentAmount={investmentAmount}
            onAmountChange={setInvestmentAmount}
            onInvest={() => setShowConfirm(true)}
            displayedAmount={displayedAmount}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isInvesting && !investSuccess && setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              {investSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 0.9, 1.1, 0.95] }}
                    transition={{ duration: 0.6 }}
                    className="w-20 h-20 mx-auto bg-brand-100 rounded-full flex items-center justify-center"
                  >
                    <CheckIcon className="w-10 h-10 text-brand-600" />
                  </motion.div>
                  <div>
                    <h3 className="font-playfair text-2xl font-bold text-ink-primary">
                      Investment Confirmed!
                    </h3>
                    <p className="text-sm text-ink-secondary mt-2">
                      You now own {equityPercentage.toFixed(4)}% of {startup.name}
                    </p>
                  </div>
                  <p className="text-xs text-ink-ghost">
                    Funds will be held in escrow until milestone verification
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-playfair text-2xl font-bold text-ink-primary">
                      Confirm Investment
                    </h3>
                  </div>

                  {/* Investment Summary */}
                  <div className="space-y-3 p-4 rounded-xl bg-surface-1 border border-surface-3">
                    <div className="flex justify-between">
                      <span className="text-ink-secondary">Investment Amount:</span>
                      <span className="font-mono font-semibold text-ink-primary">
                        Rs {investmentAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-px bg-surface-3" />
                    <div className="flex justify-between">
                      <span className="text-ink-secondary">Equity Stake:</span>
                      <span className="font-mono font-bold text-brand-600">
                        {equityPercentage.toFixed(4)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-secondary">Company:</span>
                      <span className="font-semibold text-ink-primary">{startup.name}</span>
                    </div>
                  </div>

                  {/* Security Note */}
                  <p className="text-xs text-ink-secondary bg-brand-50 p-3 rounded-lg">
                    🔒 Your funds are held in escrow until milestones are verified and released according to schedule
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setShowConfirm(false)}
                      disabled={isInvesting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 border border-surface-3 rounded-lg font-medium text-ink-primary hover:bg-surface-1 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleInvest}
                      disabled={isInvesting}
                      whileHover={{ scale: isInvesting ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-brand-600 hover:bg-brand-700 rounded-lg font-medium text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isInvesting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Processing...
                        </>
                      ) : (
                        'Confirm & Invest'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Investment Widget Component
interface InvestmentWidgetProps {
  startup: Startup
  investmentAmount: number
  onAmountChange: (amount: number) => void
  onInvest: () => void
  displayedAmount: number
}

const InvestmentWidget: React.FC<InvestmentWidgetProps & { displayedAmount: number }> = ({
  startup,
  investmentAmount,
  onAmountChange,
  onInvest,
  displayedAmount,
}) => {
  const fundedPercent = (displayedAmount / startup.funding_goal) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-brand-100 p-6 space-y-6 shadow-2xl"
    >
      {/* Funding Bar */}
      <div>
        <FundingBar
          raised={displayedAmount}
          goal={startup.funding_goal}
          size="lg"
          animated
        />
        <p className="text-sm text-ink-secondary mt-3">
          Rs {(displayedAmount / 1000000).toFixed(1)}M of Rs {(startup.funding_goal / 1000000).toFixed(1)}M
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-surface-1">
          <p className="text-xs text-ink-secondary font-medium mb-1">Funded</p>
          <p className="font-mono text-lg font-bold text-brand-600">{Math.round(fundedPercent)}%</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-surface-1">
          <p className="text-xs text-ink-secondary font-medium mb-1">Investors</p>
          <p className="font-mono text-lg font-bold text-ink-primary">{startup.investor_count || 0}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-surface-1">
          <p className="text-xs text-ink-secondary font-medium mb-1">Days Left</p>
          <p className="font-mono text-lg font-bold text-ink-primary">--</p>
        </div>
      </div>

      {/* Equity Calculator */}
      <EquityCalculator
        amount={investmentAmount}
        fundingGoal={startup.funding_goal}
        equityOffered={startup.equity_offered}
        onAmountChange={onAmountChange}
      />

      {/* Invest Button */}
      <motion.button
        onClick={onInvest}
        disabled={investmentAmount < (startup.min_investment || 50000)}
        whileHover={investmentAmount >= (startup.min_investment || 50000) ? { scale: 1.05 } : {}}
        whileTap={investmentAmount >= (startup.min_investment || 50000) ? { scale: 0.95 } : {}}
        className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
          investmentAmount >= (startup.min_investment || 50000)
            ? 'bg-brand-600 hover:bg-brand-700 text-white cursor-pointer'
            : 'bg-surface-2 text-ink-secondary cursor-not-allowed'
        }`}
      >
        {investmentAmount >= (startup.min_investment || 50000)
          ? 'Invest Now'
          : `Min Rs ${((startup.min_investment || 50000) / 1000).toFixed(0)}K`}
      </motion.button>

      {/* Security Badge */}
      <div className="p-3 rounded-lg bg-brand-50 border border-brand-200">
        <p className="text-xs text-brand-900 font-medium">
          🔒 Funds held in escrow until milestones are verified
        </p>
      </div>
    </motion.div>
  )
}

export default StartupDetailPage
