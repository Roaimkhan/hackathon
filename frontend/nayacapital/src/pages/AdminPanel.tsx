import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { normalizeStartupRow } from '../lib/compat'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import toast from 'react-hot-toast'
import {
  Cog6ToothIcon,
  RocketLaunchIcon,
  IdentificationIcon,
  FlagIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

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

// Types
interface PendingStartup {
  id: string
  name: string
  founder_name: string
  sector: string
  funding_goal: number
  submitted_at: string
  story: string
  pitch_deck_url?: string
  tagline: string
  equity_offered: number
}

interface MilestoneProof {
  id: string
  startup_id: string
  startup_name: string
  milestone_title: string
  fund_percentage: number
  fund_amount: number
  submitted_at: string
  proof_url: string
  status: 'approved' | 'rejected'
}

// Sidebar Component
const Sidebar: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Cog6ToothIcon },
    { id: 'startups', label: 'Startups', icon: RocketLaunchIcon },
    { id: 'kyc', label: 'KYC', icon: IdentificationIcon },
    { id: 'milestones', label: 'Milestones', icon: FlagIcon },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-60 bg-brand-950 text-white flex flex-col border-r border-brand-900 pt-20">
      {/* Nav Items */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-brand-900 text-white border-l-4 border-brand-600'
                  : 'text-white/70 hover:text-white hover:bg-brand-900/50'
              }`}
              whileHover={{ x: 4 }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.button>
          )
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t border-brand-900 p-4">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-brand-900">
          <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.full_name}</p>
            <p className="text-xs text-brand-200">Admin</p>
          </div>
        </div>
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-brand-200 hover:bg-brand-900 transition-colors"
          whileHover={{ x: 4 }}
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Logout
        </motion.button>
      </div>
    </div>
  )
}

// Metric Card Component
const MetricCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string; suffix?: string }> = ({
  label,
  value,
  icon,
  color,
  suffix = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8 }}
    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6"
  >
    <div className="flex items-start justify-between mb-4">
      <span className="text-ink-secondary text-sm font-medium">{label}</span>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
    <div className="text-3xl font-display font-bold text-ink-primary">
      <SafeCountUp
        end={value}
        duration={2}
        separator=","
        suffix={suffix}
      />
    </div>
  </motion.div>
)

// Overview Tab
const OverviewTab: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div>
      <h1 className="text-4xl font-display font-bold text-ink-primary mb-2">
        Admin Overview
      </h1>
      <p className="text-ink-secondary">Monitor platform metrics and operations</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <MetricCard
        label="Total Users"
        value={3240}
        icon={<span className="text-2xl">👥</span>}
        color="bg-blue-50"
      />
      <MetricCard
        label="Pending KYC"
        value={12}
        icon={<span className="text-2xl">📋</span>}
        color="bg-yellow-50"
      />
      <MetricCard
        label="Pending Startups"
        value={8}
        icon={<span className="text-2xl">🚀</span>}
        color="bg-purple-50"
      />
      <MetricCard
        label="Active Startups"
        value={42}
        icon={<span className="text-2xl">✅</span>}
        color="bg-green-50"
      />
      <MetricCard
        label="Total Escrow (Rs)"
        value={45000000}
        icon={<span className="text-2xl">💰</span>}
        color="bg-red-50"
        suffix=""
      />
    </div>
  </motion.div>
)

// Startup Review Drawer
const StartupReviewDrawer: React.FC<{
  startup: PendingStartup | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
}> = ({ startup, isOpen, onClose, onApprove, onReject }) => {
  const [rejectReason, setRejectReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    setIsRejecting(true)
    onReject(startup!.id, rejectReason)
    setTimeout(() => {
      setRejectReason('')
      setIsRejecting(false)
      onClose()
    }, 500)
  }

  return (
    <AnimatePresence>
      {isOpen && startup && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-surface-2 p-6 flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-ink-primary">Review Startup</h2>
              <motion.button
                onClick={onClose}
                whileHover={{ rotate: 90 }}
                className="text-ink-secondary hover:text-ink-primary"
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <p className="text-xs text-ink-secondary mb-1">Startup Name</p>
                <p className="text-lg font-semibold text-ink-primary">{startup.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-ink-secondary mb-1">Founder</p>
                  <p className="font-semibold text-ink-primary">{startup.founder_name}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-secondary mb-1">Sector</p>
                  <p className="font-semibold text-ink-primary">{startup.sector}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-ink-secondary mb-1">Funding Goal</p>
                  <p className="font-mono font-semibold text-ink-primary">
                    Rs {startup.funding_goal.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-secondary mb-1">Equity Offered</p>
                  <p className="font-mono font-semibold text-ink-primary">{startup.equity_offered}%</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-ink-secondary mb-2">Tagline</p>
                <p className="text-ink-primary">{startup.tagline}</p>
              </div>

              <div>
                <p className="text-xs text-ink-secondary mb-2">Story</p>
                <p className="text-sm text-ink-primary leading-relaxed">{startup.story}</p>
              </div>

              {startup.pitch_deck_url && (
                <motion.a
                  href={startup.pitch_deck_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="block bg-brand-50 border border-brand-200 rounded-lg px-4 py-3 text-center font-semibold text-brand-600 hover:bg-brand-100 transition-colors"
                >
                  📄 View Pitch Deck
                </motion.a>
              )}

              {/* Rejection Reason Input */}
              {isRejecting && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 rounded-lg p-4"
                >
                  <label className="block text-sm font-semibold text-ink-primary mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this startup is being rejected..."
                    rows={3}
                    className="w-full border border-red-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                  />
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-surface-2">
                <motion.button
                  onClick={() =>
                    isRejecting ? handleReject() : setIsRejecting(true)
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isRejecting
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  <XCircleIcon className="w-4 h-4" />
                  {isRejecting ? 'Confirm Reject' : 'Reject'}
                </motion.button>

                <motion.button
                  onClick={() => onApprove(startup.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="py-2 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Approve
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Empty State Component
const EmptyState: React.FC<{ message: string; icon: React.ReactNode }> = ({ message, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="py-12 text-center"
  >
    <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4 text-3xl">
      {icon}
    </div>
    <p className="text-ink-secondary">{message}</p>
  </motion.div>
)

// Startup Verification Tab
const StartupsTab: React.FC = () => {
  const [startups, setStartups] = useState<PendingStartup[]>([])
  const [selectedStartup, setSelectedStartup] = useState<PendingStartup | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPendingStartups = async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/startups/pending')
        const rows = (Array.isArray(data) ? data : data?.data || []).map(normalizeStartupRow)

        setStartups(
          rows.map((row: any) => ({
            id: row.id,
            name: row.name,
            founder_name: 'Founder',
            sector: row.sector,
            funding_goal: row.funding_goal || 0,
            submitted_at: row.created_at || row.time || new Date().toISOString(),
            story: row.story || '',
            pitch_deck_url: row.pitch_deck_url,
            tagline: row.tagline || '',
            equity_offered: row.equity_offered || 0,
          }))
        )
      } catch (err: any) {
        const message = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to fetch pending startups'
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingStartups()
  }, [])

  const handleApprove = useCallback(async (id: string) => {
    try {
      await api.post(`/startups/${id}/approve`)
      toast.success('Startup approved! ✓')
      setStartups((prev) => prev.filter((s) => s.id !== id))
      setIsDrawerOpen(false)
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to approve startup'
      toast.error(message)
    }
  }, [])

  const handleReject = useCallback(async (id: string, reason: string) => {
    try {
      await api.post(`/startups/${id}/reject`, { reason })
      toast.error(`Startup rejected - ${reason.substring(0, 30)}...`)
      setStartups((prev) => prev.filter((s) => s.id !== id))
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to reject startup'
      toast.error(message)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-display font-bold text-ink-primary mb-1">
          Startup Verification
        </h1>
        <p className="text-ink-secondary">{startups.length} pending review</p>
      </div>

      {loading ? (
        <EmptyState message="Loading pending startups..." icon="⏳" />
      ) : startups.length === 0 ? (
        <EmptyState message="No pending startups" icon="🎉" />
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-1 border-b border-surface-2">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink-secondary">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink-secondary">
                    Founder
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink-secondary">
                    Sector
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink-secondary">
                    Funding Goal
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink-secondary">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-ink-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {startups.map((startup, idx) => (
                  <motion.tr
                    key={startup.id}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`border-b border-surface-2 hover:bg-surface-1 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-surface-1'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-ink-primary">
                      {startup.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-secondary">{startup.founder_name}</td>
                    <td className="px-6 py-4 text-sm text-ink-secondary">{startup.sector}</td>
                    <td className="px-6 py-4 text-sm font-mono text-ink-primary">
                      Rs {startup.funding_goal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-secondary">{startup.submitted_at}</td>
                    <td className="px-6 py-4 text-sm">
                      <motion.button
                        onClick={() => {
                          setSelectedStartup(startup)
                          setIsDrawerOpen(true)
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
                      >
                        Review
                        <ChevronRightIcon className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <StartupReviewDrawer
        startup={selectedStartup}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setSelectedStartup(null)
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </motion.div>
  )
}

// KYC Tab
const KycTab: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-display font-bold text-ink-primary mb-1">KYC Verification</h1>
        <p className="text-ink-secondary">KYC is verified via investor self-service endpoint</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <p className="text-ink-secondary mb-2">
          Current backend supports investor KYC submission and auto-verification through the user flow.
        </p>
        <p className="text-sm text-ink-secondary">
          Admin-side manual KYC review endpoints are not present in the backend API.
        </p>
      </div>
    </motion.div>
  )
}

// Milestones Tab
const MilestonesTab: React.FC = () => {
  const [, setMilestones] = useState<MilestoneProof[]>([])
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSubmittedMilestones = async () => {
      try {
        setLoading(false)
        // Milestones are now auto-approved on submission, so there's nothing for admins to review
        setMilestones([])
      } catch (err: any) {
        const message = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to fetch milestone submissions'
        toast.error(message)
      }
    }

    fetchSubmittedMilestones()
  }, [])

  const handleApprove = useCallback(async (id: string, amount: number) => {
    try {
      await api.post(`/milestones/${id}/approve`)
      toast.success(`Rs ${amount.toLocaleString()} released to founder ✓`)
      setMilestones((prev) => prev.filter((m) => m.id !== id))
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to approve milestone'
      toast.error(message)
    }
  }, [])

  const handleReject = useCallback(async (id: string) => {
    const reason = rejectReason[id]
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      await api.post(`/milestones/${id}/reject`, { reason })
      toast.error('Milestone rejected')
      setMilestones((prev) => prev.filter((m) => m.id !== id))
      setRejectReason((prev) => ({ ...prev, [id]: '' }))
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to reject milestone'
      toast.error(message)
    }
  }, [rejectReason])

  // No pending milestones - all milestones are auto-approved on founder submission
  const pending: MilestoneProof[] = []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-display font-bold text-ink-primary mb-1">
          Milestone Approval
        </h1>
        <p className="text-ink-secondary">{pending.length} pending proof review</p>
      </div>

      {loading ? (
        <EmptyState message="Loading milestone submissions..." icon="⏳" />
      ) : pending.length === 0 ? (
        <EmptyState message="No pending milestone proofs" icon="🏁" />
      ) : (
        <div className="space-y-4">
          {pending.map((milestone) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-2xl shadow-md p-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-ink-secondary mb-1">Startup</p>
                  <p className="font-semibold text-ink-primary">{milestone.startup_name}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-secondary mb-1">Milestone</p>
                  <p className="font-semibold text-ink-primary">{milestone.milestone_title}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-secondary mb-1">Fund %</p>
                  <p className="font-mono font-semibold text-brand-600">{milestone.fund_percentage}%</p>
                </div>
                <div>
                  <p className="text-xs text-ink-secondary mb-1">Amount</p>
                  <p className="font-mono font-semibold text-ink-primary">
                    Rs {milestone.fund_amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-surface-2">
                <p className="text-xs text-ink-secondary">Submitted: {milestone.submitted_at}</p>
                <motion.a
                  href={milestone.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  className="text-brand-600 hover:text-brand-700 font-semibold text-sm flex items-center gap-1"
                >
                  <EyeIcon className="w-4 h-4" />
                  View Proof
                </motion.a>
              </div>

              {/* Rejection Reason Input */}
              <motion.textarea
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="w-full border border-surface-3 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500 mb-4 resize-none"
                rows={2}
                placeholder="Rejection reason (if rejecting)..."
                value={rejectReason[milestone.id] || ''}
                onChange={(e) =>
                  setRejectReason((prev) => ({
                    ...prev,
                    [milestone.id]: e.target.value,
                  }))
                }
              />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => handleReject(milestone.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                >
                  Reject
                </motion.button>
                <motion.button
                  onClick={() => handleApprove(milestone.id, milestone.fund_amount)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Approve & Release Funds
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// Main Component
const AdminPanel: React.FC = () => {
  useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-surface-1">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="ml-60">
        <div className="p-8">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'startups' && <StartupsTab />}
          {activeTab === 'kyc' && <KycTab />}
          {activeTab === 'milestones' && <MilestonesTab />}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
