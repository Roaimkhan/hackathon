import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useFounder } from '../hooks'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  RocketLaunchIcon,
  FlagIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline'

// Types
interface Milestone {
  id: string
  title: string
  fund_percentage: number
  description: string
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  rejection_reason?: string
}

interface Startup {
  id: string
  name: string
  sector: string
  tagline: string
  funding_goal: number
  amount_raised: number
  equity_offered: number
  status: string
  milestones: Milestone[]
  investor_count: number
}

interface FormData {
  name: string
  sector: string
  tagline: string
  funding_goal: number
  equity_offered: number
  story: string
  pitch_deck?: File
  milestones: Array<{
    title: string
    fund_percentage: number
    description: string
  }>
}

// Sidebar Component (similar to InvestorDashboard)
const Sidebar: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'startup', label: 'My Startup', icon: RocketLaunchIcon },
    { id: 'milestones', label: 'Milestones', icon: FlagIcon },
    { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
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
            {user?.full_name
              ? user.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
              : 'F'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.full_name}</p>
            <p className="text-xs text-brand-200">Founder</p>
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

// No Startup State
const NoStartupState: React.FC<{ onCreateClick: () => void }> = ({ onCreateClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="min-h-[60vh] flex flex-col items-center justify-center"
  >
    <div className="text-center mb-8">
      <div className="w-24 h-24 rounded-full bg-brand-50 flex items-center justify-center mb-6 mx-auto">
        <RocketLaunchIcon className="w-12 h-12 text-brand-600" />
      </div>
      <h2 className="text-3xl font-display font-bold text-ink-primary mb-2">
        List Your Startup
      </h2>
      <p className="text-ink-secondary max-w-md">
        Start your fundraising journey and connect with investors ready to support your vision
      </p>
    </div>

    <motion.button
      onClick={onCreateClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-brand-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors flex items-center gap-2"
    >
      <PlusIcon className="w-5 h-5" />
      Create Startup Listing
    </motion.button>
  </motion.div>
)

// Multi-Step Form
const StartupCreationForm: React.FC<{ onSuccess: (formData: FormData) => Promise<void> | void; onCancel: () => void }> = ({
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sector: '',
    tagline: '',
    funding_goal: 0,
    equity_offered: 0,
    story: '',
    milestones: [],
  })

  const sectors = ['Fintech', 'AgriTech', 'EdTech', 'HealthTech', 'Retail', 'Other']

  // Validation
  const isMilestonesSumValid = useMemo(
    () => {
      if (formData.milestones.length === 0) return false
      const sum = formData.milestones.reduce((acc, m) => acc + m.fund_percentage, 0)
      return Math.abs(sum - 100) < 0.01
    },
    [formData.milestones]
  )

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.sector && formData.tagline && formData.funding_goal > 0
      case 2:
        return formData.story.length > 20
      case 3:
        return isMilestonesSumValid
      case 4:
        return true
      default:
        return false
    }
  }

  const handleMilestoneAdd = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { title: '', fund_percentage: 0, description: '' },
      ],
    }))
  }

  const handleMilestoneChange = (
    idx: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...formData.milestones]
    updated[idx] = { ...updated[idx], [field]: value }
    setFormData((prev) => ({ ...prev, milestones: updated }))
  }

  const handleMilestoneDelete = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== idx),
    }))
  }

  const handleSubmit = async () => {
    await onSuccess(formData)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-surface-2 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-ink-primary">
            Create Your Startup Listing
          </h2>
          <motion.button
            onClick={onCancel}
            whileHover={{ rotate: 90 }}
            className="text-ink-secondary hover:text-ink-primary"
          >
            <XMarkIcon className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-surface-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <motion.button
                key={s}
                onClick={() => s < step && setStep(s)}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                  s === step
                    ? 'bg-brand-600 text-white'
                    : s < step
                      ? 'bg-green-100 text-green-700'
                      : 'bg-surface-2 text-ink-secondary'
                }`}
              >
                {s === 1 && 'Basic Info'}
                {s === 2 && 'Pitch'}
                {s === 3 && 'Milestones'}
                {s === 4 && 'Review'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-ink-primary mb-2">
                    Startup Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., TechVenture AI"
                    className="w-full border border-surface-3 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink-primary mb-3">
                    Sector
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {sectors.map((sector) => (
                      <motion.button
                        key={sector}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, sector }))
                        }
                        whileHover={{ scale: 1.02 }}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.sector === sector
                            ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold'
                            : 'border-surface-2 bg-white text-ink-secondary hover:border-brand-300'
                        }`}
                      >
                        {sector}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink-primary mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tagline: e.target.value }))
                    }
                    placeholder="One-line description of your startup"
                    className="w-full border border-surface-3 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink-primary mb-2">
                      Funding Goal (Rs)
                    </label>
                    <input
                      type="number"
                      value={formData.funding_goal}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          funding_goal: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="2000000"
                      className="w-full border border-surface-3 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-primary mb-2">
                      Equity Offered (%)
                    </label>
                    <input
                      type="number"
                      value={formData.equity_offered}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          equity_offered: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="20"
                      max="100"
                      className="w-full border border-surface-3 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-ink-primary mb-2">
                    Your Story
                  </label>
                  <textarea
                    value={formData.story}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, story: e.target.value }))
                    }
                    placeholder="Tell us about your vision, mission, and why you're building this..."
                    rows={6}
                    className="w-full border border-surface-3 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 resize-none"
                  />
                  <p className="text-xs text-ink-secondary mt-2">
                    {formData.story.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink-primary mb-3">
                    Pitch Deck
                  </label>
                  <motion.div
                    whileHover={{ borderColor: '#16A34A', backgroundColor: '#F0FDF4' }}
                    className="border-2 border-dashed border-surface-3 rounded-lg p-8 text-center cursor-pointer transition-all"
                  >
                    <ArrowUpTrayIcon className="w-8 h-8 text-brand-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-ink-primary mb-1">
                      Drop your pitch deck here
                    </p>
                    <p className="text-xs text-ink-secondary">
                      PDF, PPT, or Google Slides link
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-semibold text-ink-primary">
                      Milestones
                    </label>
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded ${
                        isMilestonesSumValid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {formData.milestones.reduce((sum, m) => sum + m.fund_percentage, 0)}%
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    {formData.milestones.map((milestone, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-surface-2 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-4 gap-3 mb-3">
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) =>
                              handleMilestoneChange(idx, 'title', e.target.value)
                            }
                            placeholder="Milestone title"
                            className="col-span-2 border border-surface-3 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-600"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={milestone.fund_percentage}
                              onChange={(e) =>
                                handleMilestoneChange(
                                  idx,
                                  'fund_percentage',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0"
                              min="0"
                              max="100"
                              className="border border-surface-3 rounded px-3 py-2 text-sm w-20 focus:outline-none focus:border-brand-600"
                            />
                            <span className="text-sm text-ink-secondary">%</span>
                          </div>
                          <motion.button
                            onClick={() => handleMilestoneDelete(idx)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </motion.button>
                        </div>
                        <textarea
                          value={milestone.description}
                          onChange={(e) =>
                            handleMilestoneChange(idx, 'description', e.target.value)
                          }
                          placeholder="Description"
                          rows={2}
                          className="w-full border border-surface-3 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-600 resize-none"
                        />
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    onClick={handleMilestoneAdd}
                    whileHover={{ scale: 1.02 }}
                    className="w-full py-2 border-2 border-dashed border-brand-300 text-brand-600 rounded-lg font-semibold hover:bg-brand-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add Milestone
                  </motion.button>

                  {!isMilestonesSumValid && formData.milestones.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600 font-semibold"
                    >
                      ⚠️ Milestone percentages must sum to 100%
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-surface-1 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-ink-secondary mb-1">Startup Name</p>
                      <p className="font-semibold text-ink-primary">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-secondary mb-1">Sector</p>
                      <p className="font-semibold text-ink-primary">{formData.sector}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-secondary mb-1">Funding Goal</p>
                      <p className="font-mono text-ink-primary">
                        Rs {formData.funding_goal.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-secondary mb-1">Equity Offered</p>
                      <p className="font-mono text-ink-primary">{formData.equity_offered}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-ink-secondary mb-1">Tagline</p>
                    <p className="text-ink-primary">{formData.tagline}</p>
                  </div>

                  <div>
                    <p className="text-xs text-ink-secondary mb-1">Milestones</p>
                    <div className="space-y-2">
                      {formData.milestones.map((m, idx) => (
                        <p key={idx} className="text-sm text-ink-primary">
                          {m.title} · {m.fund_percentage}%
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-ink-secondary text-center">
                  Review your information above. Once submitted, your listing will be sent for review.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-surface-2 p-6 flex gap-3">
          <motion.button
            onClick={() => (step > 1 ? setStep(step - 1) : onCancel())}
            whileHover={{ scale: 1.02 }}
            className="flex-1 py-3 border border-surface-3 rounded-lg text-ink-primary font-semibold hover:bg-surface-1 transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </motion.button>
          <motion.button
            onClick={() => (step < 4 ? setStep(step + 1) : handleSubmit())}
            disabled={!canProceed()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {step === 4 ? 'Submit for Review' : 'Next'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Has Startup View
const StartupManagementView: React.FC<{ startup: Startup; onSubmitProof: (milestoneId: string) => Promise<void>; proofSubmitting: boolean }> = ({ startup, onSubmitProof, proofSubmitting }) => {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null)

  const statusConfig: {
    [key: string]: { bg: string; text: string; label: string; icon: React.ReactNode }
  } = {
    pending: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      label: 'Under Review',
      icon: <ExclamationCircleIcon className="w-5 h-5" />,
    },
    under_review: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      label: 'Under Review',
      icon: <ExclamationCircleIcon className="w-5 h-5" />,
    },
    active: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      label: 'Active — Raising',
      icon: <RocketLaunchIcon className="w-5 h-5" />,
    },
    funded: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      label: 'Funded',
      icon: <CheckCircleIcon className="w-5 h-5" />,
    },
  }

  const config = statusConfig[startup.status] || statusConfig.pending
  const fundingPercentage = (startup.amount_raised / startup.funding_goal) * 100
  const approvedMilestones = startup.milestones.filter((m) => m.status === 'approved').length
  const escrowReleased = startup.milestones
    .filter((m) => m.status === 'approved')
    .reduce((sum, m) => sum + (startup.funding_goal * m.fund_percentage) / 100, 0)
  const escrowRemaining = startup.amount_raised - escrowReleased

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Status Banner */}
      <motion.div
        className={`${config.bg} ${config.text} rounded-lg px-6 py-4 flex items-center gap-3`}
      >
        {config.icon}
        <div>
          <p className="font-semibold">{config.label}</p>
          <p className="text-sm opacity-75">Listing ID: {startup.id}</p>
        </div>
      </motion.div>

      {/* Funding Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-bold text-ink-primary">Funding Progress</h3>
          <span className="font-mono font-semibold text-brand-600">
            {fundingPercentage.toFixed(1)}%
          </span>
        </div>

        <div className="bg-surface-2 rounded-full h-4 overflow-hidden mb-4">
          <motion.div
            className="h-full bg-brand-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${fundingPercentage}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-ink-secondary mb-1">Raised</p>
            <p className="font-mono text-lg font-bold text-ink-primary">
              Rs {startup.amount_raised.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-secondary mb-1">Goal</p>
            <p className="font-mono text-lg font-bold text-ink-secondary">
              Rs {startup.funding_goal.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-secondary mb-1">Investors</p>
            <p className="font-mono text-lg font-bold text-ink-primary">{startup.investor_count}</p>
          </div>
        </div>
      </motion.div>

      {/* Escrow Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-6"
      >
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-ink-primary">Released to You</h4>
          </div>
          <p className="font-mono text-2xl font-bold text-green-600">
            Rs {escrowReleased.toLocaleString()}
          </p>
          <p className="text-xs text-ink-secondary mt-2">{approvedMilestones} milestones approved</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-ink-primary">Still in Escrow</h4>
          </div>
          <p className="font-mono text-2xl font-bold text-yellow-600">
            Rs {escrowRemaining.toLocaleString()}
          </p>
          <p className="text-xs text-ink-secondary mt-2">Pending milestone approval</p>
        </div>
      </motion.div>

      {/* Milestone Manager */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-md p-6"
      >
        <h3 className="text-lg font-display font-bold text-ink-primary mb-4">
          Milestone Manager
        </h3>

        <div className="space-y-3">
          {startup.milestones.map((milestone, idx) => {
            const isPreviousApproved = idx === 0 || startup.milestones[idx - 1].status === 'approved'
            const canSubmitProof = milestone.status === 'pending' && isPreviousApproved

            return (
              <motion.div
                key={milestone.id}
                onClick={() =>
                  setExpandedMilestone(expandedMilestone === milestone.id ? null : milestone.id)
                }
                className="border border-surface-2 rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer"
              >
                <div className="bg-surface-1 p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-ink-primary">{milestone.title}</p>
                      <span className="text-xs font-mono bg-brand-100 text-brand-700 px-2 py-1 rounded">
                        {milestone.fund_percentage}%
                      </span>
                    </div>
                    <p className="text-sm text-ink-secondary">{milestone.description}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="ml-4 flex-shrink-0">
                    {milestone.status === 'approved' && (
                      <div className="flex items-center gap-1">
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        <span className="text-xs font-semibold text-green-700">Approved</span>
                      </div>
                    )}
                    {milestone.status === 'submitted' && (
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-yellow-700">Reviewing</span>
                      </div>
                    )}
                    {milestone.status === 'pending' && (
                      <span className="text-xs font-semibold text-ink-secondary">Pending</span>
                    )}
                    {milestone.status === 'rejected' && (
                      <div className="flex items-center gap-1">
                        <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                        <span className="text-xs font-semibold text-red-700">Rejected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedMilestone === milestone.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-surface-2 p-4 bg-white"
                    >
                      {milestone.status === 'approved' && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-green-600 font-semibold text-sm mb-4"
                        >
                          ✓ Rs {(startup.funding_goal * milestone.fund_percentage) / 100} released to
                          your account
                        </motion.p>
                      )}

                      {milestone.status === 'rejected' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mb-4 p-3 bg-red-50 rounded-lg"
                        >
                          <p className="text-xs font-semibold text-red-700 mb-2">Rejection Reason:</p>
                          <p className="text-sm text-red-600">
                            {milestone.rejection_reason ||
                              'Please resubmit with additional documentation'}
                          </p>
                        </motion.div>
                      )}

                      {canSubmitProof && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSubmitProof(milestone.id)
                          }}
                          disabled={proofSubmitting}
                          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors flex items-center gap-2"
                        >
                          <ArrowUpTrayIcon className="w-4 h-4" />
                          {proofSubmitting ? 'Submitting...' : 'Submit Proof'}
                        </motion.button>
                      )}

                      {milestone.status === 'rejected' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSubmitProof(milestone.id)
                          }}
                          disabled={proofSubmitting}
                          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors flex items-center gap-2"
                        >
                          <ArrowUpTrayIcon className="w-4 h-4" />
                          {proofSubmitting ? 'Submitting...' : 'Resubmit'}
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Investors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-md p-6"
      >
        <h3 className="text-lg font-display font-bold text-ink-primary mb-4">
          Your Investors
        </h3>
        <p className="text-2xl font-bold text-brand-600 mb-4">{startup.investor_count}</p>

        {/* Avatar Stack */}
        <div className="flex -space-x-3">
          {Array.from({ length: Math.min(startup.investor_count, 5) }).map((_, idx) => (
            <div
              key={idx}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-md"
            >
              {String.fromCharCode(65 + idx)}.
            </div>
          ))}
          {startup.investor_count > 5 && (
            <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-ink-secondary font-bold text-sm border-2 border-white">
              +{startup.investor_count - 5}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main Component
const FounderDashboard: React.FC = () => {
  useAuth()
  const { startup, loading, saving, createStartup, submitMilestoneProof, refetch } = useFounder()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showForm, setShowForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleFormSuccess = async (formData: FormData) => {
    const created = await createStartup({
      name: formData.name,
      sector: formData.sector,
      tagline: formData.tagline,
      funding_goal: formData.funding_goal,
      equity_offered: formData.equity_offered,
      story: formData.story,
      pitch_deck_url: formData.pitch_deck?.name,
      milestones: formData.milestones,
    })

    if (!created) {
      return
    }

    setShowForm(false)
    setSuccessMessage('Startup listing created successfully! Under review...')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleSubmitProof = async (milestoneId: string) => {
    const ok = await submitMilestoneProof(milestoneId)
    if (ok) {
      await refetch()
    }
  }

  return (
    <div className="min-h-screen bg-surface-1">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="ml-60">
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 font-semibold flex items-center gap-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  {successMessage}
                </motion.div>
              )}

              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 text-ink-secondary"
                >
                  Loading your startup...
                </motion.div>
              ) : !startup ? (
                <NoStartupState onCreateClick={() => setShowForm(true)} />
              ) : (
                <StartupManagementView
                  startup={startup}
                  onSubmitProof={handleSubmitProof}
                  proofSubmitting={saving}
                />
              )}
            </>
          )}

          {activeTab === 'startup' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <p className="text-ink-secondary mb-4">Startup details coming soon</p>
            </motion.div>
          )}

          {activeTab === 'milestones' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <p className="text-ink-secondary mb-4">Milestone tracking coming soon</p>
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <p className="text-ink-secondary mb-4">Document management coming soon</p>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <p className="text-ink-secondary mb-4">Settings coming soon</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Multi-Step Form Modal */}
      <AnimatePresence>
        {showForm && (
          <StartupCreationForm onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default FounderDashboard
