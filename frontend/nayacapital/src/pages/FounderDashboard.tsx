import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useFounder } from '../hooks'
import api from '../lib/api'
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
  status: 'pending' | 'approved' | 'rejected'
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
  funding_goal: number | string
  equity_offered: number | string
  story: string
  pitch_video_url?: string
  milestones: Array<{
    title: string
    fund_percentage: number | string
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
    { id: 'startup', label: 'My Startups', icon: RocketLaunchIcon },
    { id: 'milestones', label: 'Milestones', icon: FlagIcon },
    { id: 'browse', label: 'Browse Startups', icon: DocumentTextIcon },
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
    <div className="sticky top-0 h-screen w-60 shrink-0 bg-brand-950 text-white flex flex-col border-r border-brand-900 pt-20">
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
const StartupCreationForm: React.FC<{
  onSuccess: (data: FormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}> = ({ onSuccess, onCancel, isSubmitting }) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sector: '',
    tagline: '',
    funding_goal: '',
    equity_offered: '',
    story: '',
    milestones: [],
  })

  const sectors = ['Fintech', 'AgriTech', 'EdTech', 'HealthTech', 'Retail', 'Other']

  // Validation
  const isMilestonesSumValid = useMemo(
    () => {
      if (formData.milestones.length === 0) return false
      const sum = formData.milestones.reduce((acc, m) => acc + (Number(m.fund_percentage) || 0), 0)
      return Math.abs(sum - 100) < 0.01
    },
    [formData.milestones]
  )

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.sector && formData.tagline && Number(formData.funding_goal) > 0
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
        { title: '', fund_percentage: '', description: '' },
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
                          funding_goal: e.target.value,
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
                          equity_offered: e.target.value,
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
                    Pitch Video (YouTube URL)
                  </label>
                  <input
                    type="url"
                    value={formData.pitch_video_url || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, pitch_video_url: e.target.value }))
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full border border-surface-3 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 mb-4"
                  />
                  {formData.pitch_video_url && (
                    <div className="w-full aspect-video bg-surface-1 rounded-lg overflow-hidden border border-surface-2 flex items-center justify-center">
                      {(() => {
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
                        const match = formData.pitch_video_url.match(regExp)
                        const isYoutube = match && match[2].length === 11
                        if (isYoutube) {
                          return (
                            <iframe
                              className="w-full h-full"
                              src={`https://www.youtube.com/embed/${match[2]}`}
                              title="Pitch Video Preview"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          )
                        }
                        return <p className="text-sm text-ink-secondary">Invalid YouTube URL</p>
                      })()}
                    </div>
                  )}
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
                      {formData.milestones.reduce((sum, m) => sum + (Number(m.fund_percentage) || 0), 0)}%
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
                                handleMilestoneChange(idx, 'fund_percentage', e.target.value)
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
                        Rs {Number(formData.funding_goal).toLocaleString()}
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
            disabled={!canProceed() || isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="flex-1 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              step === 4 ? 'Submit for Review' : 'Next'
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Multi-Startup List View
const StartupsListView: React.FC<{ startups: Startup[], onSelect: (id: string) => void, onCreateClick: () => void }> = ({ startups, onSelect, onCreateClick }) => {
  if (startups.length === 0) {
    return <NoStartupState onCreateClick={onCreateClick} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-ink-primary">My Startups</h2>
          <p className="text-sm text-ink-secondary">Manage your active fundraising campaigns</p>
        </div>
        <motion.button
          onClick={onCreateClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700 transition-colors flex items-center gap-2 text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Create New listing
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {startups.map((s) => {
          const fundingPercentage = (s.amount_raised / s.funding_goal) * 100
          
          return (
            <motion.div
              key={s.id}
              onClick={() => onSelect(s.id)}
              whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              className="bg-white border border-surface-2 rounded-2xl p-6 cursor-pointer hover:border-brand-300 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-ink-primary truncate">{s.name}</h3>
                  <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded inline-block mt-1">
                    {s.sector}
                  </span>
                </div>
                <div className={`w-3 h-3 rounded-full ${s.status === 'active' ? 'bg-green-500' : s.status === 'pending' || s.status === 'under_review' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
              </div>
              
              <p className="text-sm text-ink-secondary line-clamp-2 mb-6 h-10">{s.tagline}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-secondary">Funded</span>
                  <span className="font-semibold text-brand-600">{fundingPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-surface-2 rounded-full h-2">
                  <div className="bg-brand-600 h-2 rounded-full" style={{ width: `${Math.min(fundingPercentage, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-ink-secondary">Raised: Rs {s.amount_raised.toLocaleString()}</span>
                  <span className="text-ink-secondary">Goal: Rs {s.funding_goal.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// Milestone Manager Component
const MilestoneManagerComponent: React.FC<{ startup: Startup; onSubmitProof: (milestoneId: string) => Promise<void>; proofSubmitting: boolean }> = ({ startup, onSubmitProof, proofSubmitting }) => {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null)

  // Auto-expand first pending milestone for better UX
  useEffect(() => {
    if (!expandedMilestone) {
      const firstPending = startup.milestones?.find(m => m.status === 'pending')
      if (firstPending) {
        setExpandedMilestone(firstPending.id)
      }
    }
  }, [startup.milestones, expandedMilestone])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-md p-6"
    >
      <h3 className="text-lg font-display font-bold text-ink-primary mb-4">
        Milestone Manager
      </h3>

      {startup.milestones?.length === 0 && (
        <p className="text-sm text-ink-secondary text-center py-8">
          No milestones yet. Create milestones when setting up your startup.
        </p>
      )}

      <div className="space-y-3">
        {startup.milestones?.map((milestone, idx) => {
          const isPreviousApproved = idx === 0 || startup.milestones[idx - 1]?.status === 'approved'
          const canSubmitProof = (milestone.status === 'pending' || !milestone.status) && isPreviousApproved

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
                      <span className="text-xs font-semibold text-green-700">Completed ✓</span>
                    </div>
                  )}
                  {(!milestone.status || milestone.status === 'pending') && (
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
                        ✓ Milestone Completed! Rs {(startup.funding_goal * milestone.fund_percentage) / 100} has been released to your wallet
                      </motion.p>
                    )}

                    {(!milestone.status || milestone.status === 'pending') && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 p-3 bg-blue-50 rounded-lg"
                      >
                        <p className="text-xs font-semibold text-blue-700 mb-2">Next Step:</p>
                        <p className="text-sm text-blue-600">
                          Upload proof of completion to unlock Rs {Math.round((startup.funding_goal * milestone.fund_percentage) / 100)} in funds
                        </p>
                      </motion.div>
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
                        {proofSubmitting ? 'Completing...' : 'Complete Milestone'}
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
  )
}

// Full Milestones Tab View
const MilestonesTabView: React.FC<{
  startups: Startup[];
  activeStartup: Startup | null;
  onSelect: (id: string) => void;
  onSubmitProof: (id: string) => Promise<void>;
  proofSubmitting: boolean;
}> = ({ startups, activeStartup, onSelect, onSubmitProof, proofSubmitting }) => {
  if (startups.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
        <p className="text-ink-secondary mb-4">You haven't listed any startups yet.</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 pb-4 overflow-x-auto border-b border-surface-2 hide-scrollbar">
        {startups.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${
              activeStartup?.id === s.id
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-surface-1 text-ink-secondary hover:bg-surface-2 border border-surface-3'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {activeStartup ? (
        <MilestoneManagerComponent
          startup={activeStartup}
          onSubmitProof={onSubmitProof}
          proofSubmitting={proofSubmitting}
        />
      ) : (
        <p className="text-center text-ink-secondary py-12">Please select a startup above</p>
      )}
    </div>
  )
}

// Has Startup View
const StartupManagementView: React.FC<{ startup: Startup; onSubmitProof: (milestoneId: string) => Promise<void>; proofSubmitting: boolean }> = ({ startup, onSubmitProof, proofSubmitting }) => {

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
      <MilestoneManagerComponent startup={startup} onSubmitProof={onSubmitProof} proofSubmitting={proofSubmitting} />

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
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { startups, startup, loading, saving, createStartup, submitMilestoneProof, refetch, selectStartup } = useFounder()
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'dashboard')
  const [showForm, setShowForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [allStartups, setAllStartups] = useState<any[]>([])
  const [loadingAllStartups, setLoadingAllStartups] = useState(false)

  React.useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Fetch all startups for browse tab
  React.useEffect(() => {
    const fetchAllStartups = async () => {
      try {
        setLoadingAllStartups(true)
        const response = await api.get('/startups')
        if (response.data && Array.isArray(response.data)) {
          setAllStartups(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch startups:', error)
      } finally {
        setLoadingAllStartups(false)
      }
    }

    if (activeTab === 'browse') {
      fetchAllStartups()
    }
  }, [activeTab])

  const handleFormSuccess = async (formData: FormData) => {
    const created = await createStartup({
      name: formData.name,
      sector: formData.sector,
      tagline: formData.tagline,
      funding_goal: Number(formData.funding_goal) || 0,
      equity_offered: Number(formData.equity_offered) || 0,
      story: formData.story,
      pitch_deck_url: formData.pitch_video_url,
      milestones: formData.milestones.map((m) => ({
        ...m,
        fund_percentage: Number(m.fund_percentage) || 0,
      })),
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

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me')
      // User context will update automatically
      return response.data
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  return (
    <div className="min-h-screen bg-surface-1 flex">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1">
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
            <StartupsListView 
              startups={startups as Startup[]} 
              onSelect={async (id) => {
                await selectStartup(id)
                setActiveTab('dashboard')
              }}
              onCreateClick={() => setShowForm(true)}
            />
          )}

          {activeTab === 'milestones' && (
            <MilestonesTabView 
              startups={startups as Startup[]} 
              activeStartup={startup} 
              onSelect={selectStartup}
              onSubmitProof={handleSubmitProof}
              proofSubmitting={saving}
            />
          )}

          {activeTab === 'browse' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-display font-bold text-ink-primary mb-2">Browse Startups</h2>
                <p className="text-ink-secondary">Discover other startups and stay updated with the ecosystem</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(allStartups || []).map((s: any, idx: number) => {
                  const fundingPercentage = (s.amount_raised / s.funding_goal) * 100
                  const isOwnStartup = startups?.some((own: any) => own.id === s.id)
                  
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' }}
                      className={`bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                        isOwnStartup 
                          ? 'border-brand-600 shadow-lg' 
                          : 'border-surface-2 hover:border-brand-300'
                      }`}
                    >
                      {/* Your Startup Badge */}
                      {isOwnStartup && (
                        <div className="mb-3 inline-block bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Your Startup
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-ink-primary truncate">{s.name}</h3>
                          <span className="text-xs bg-surface-2 text-ink-secondary px-2 py-1 rounded inline-block mt-2 font-medium">
                            {s.sector}
                          </span>
                        </div>
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ml-2 ${
                          s.status === 'active' ? 'bg-green-500' : 
                          s.status === 'pending' || s.status === 'under_review' ? 'bg-yellow-500' : 
                          'bg-blue-500'
                        }`} />
                      </div>
                      
                      <p className="text-sm text-ink-secondary line-clamp-2 mb-4 h-10">{s.tagline}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-ink-secondary font-medium">Funded</span>
                            <span className="font-semibold text-brand-600">{fundingPercentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-surface-2 rounded-full h-2.5">
                            <div 
                              className="bg-gradient-to-r from-brand-500 to-brand-600 h-2.5 rounded-full" 
                              style={{ width: `${Math.min(fundingPercentage, 100)}%` }} 
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <p className="text-xs text-ink-secondary mb-0.5">Raised</p>
                            <p className="text-sm font-mono font-bold text-ink-primary">Rs {(s.amount_raised / 100000).toFixed(1)}L</p>
                          </div>
                          <div>
                            <p className="text-xs text-ink-secondary mb-0.5">Goal</p>
                            <p className="text-sm font-mono font-bold text-ink-secondary">Rs {(s.funding_goal / 100000).toFixed(1)}L</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 text-xs text-ink-secondary">
                          <span>👥</span>
                          <span>{s.investor_count || 0} investors</span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/startups/${s.id}`)}
                        className="w-full mt-4 py-2.5 bg-brand-50 text-brand-600 rounded-lg font-semibold hover:bg-brand-100 transition-colors text-sm"
                      >
                        View Details
                      </motion.button>
                    </motion.div>
                  )
                })}
              </div>

              {(!allStartups || allStartups.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-ink-secondary mb-4">No startups to browse yet</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <SettingsTabContent user={user} refreshUser={refreshUser} />
          )}
        </div>
      </div>

      {/* Multi-Step Form Modal */}
      <AnimatePresence>
        {showForm && (
          <StartupCreationForm 
            onSuccess={handleFormSuccess} 
            onCancel={() => setShowForm(false)} 
            isSubmitting={saving}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Settings Tab Content
const SettingsTabContent: React.FC<{ user: any; refreshUser: () => Promise<void> }> = ({ user, refreshUser }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    location: user?.location || '',
    bio: user?.bio || '',

    // Company Information
    company_name: user?.company_name || '',
    company_description: user?.company_description || '',
    founded_date: user?.founded_date || '',
    company_sector: user?.company_sector || '',
    stage: user?.stage || 'seed',

    // Financial Information
    company_logo_url: user?.company_logo_url || '',
    pitch_deck_url: user?.pitch_deck_url || '',
    website_url: user?.website_url || '',
    linkedin_url: user?.linkedin_url || '',

    // Team Information
    team_size: user?.team_size || 1,
    founder_role: user?.founder_role || '',

    // KYC Status (read-only display)
    kyc_status: user?.kyc_status || 'pending',
    identity_verified: user?.identity_verified || false,
    bank_verified: user?.bank_verified || false,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const updateData = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        location: formData.location,
        bio: formData.bio,
        company_name: formData.company_name,
        company_description: formData.company_description,
        founded_date: formData.founded_date,
        company_sector: formData.company_sector,
        stage: formData.stage,
        company_logo_url: formData.company_logo_url,
        pitch_deck_url: formData.pitch_deck_url,
        website_url: formData.website_url,
        linkedin_url: formData.linkedin_url,
        team_size: formData.team_size,
        founder_role: formData.founder_role,
      }
      
      await api.patch('/auth/me', updateData)
      await refreshUser()
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-display font-bold text-ink-primary">Profile Settings</h2>
            <p className="text-ink-secondary">Manage your founder profile and company information</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
          >
            Edit Profile
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md p-6 border border-surface-2"
          >
            <h3 className="text-lg font-display font-bold text-ink-primary mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Full Name</p>
                <p className="text-ink-primary font-medium">{formData.full_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Email</p>
                <p className="text-ink-primary font-medium">{formData.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Phone</p>
                <p className="text-ink-primary font-medium">{formData.phone_number || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Location</p>
                <p className="text-ink-primary font-medium">{formData.location || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Bio</p>
                <p className="text-ink-primary font-medium line-clamp-3">{formData.bio || '—'}</p>
              </div>
            </div>
          </motion.div>

          {/* Company Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-6 border border-surface-2"
          >
            <h3 className="text-lg font-display font-bold text-ink-primary mb-4">Company Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Company Name</p>
                <p className="text-ink-primary font-medium">{formData.company_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Sector</p>
                <p className="text-ink-primary font-medium">{formData.company_sector || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Stage</p>
                <span className="inline-block bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                  {formData.stage || '—'}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Founded</p>
                <p className="text-ink-primary font-medium">{formData.founded_date || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Team Size</p>
                <p className="text-ink-primary font-medium">{formData.team_size} members</p>
              </div>
            </div>
          </motion.div>

          {/* Links & Media Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-6 border border-surface-2"
          >
            <h3 className="text-lg font-display font-bold text-ink-primary mb-4">Links & Media</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Website</p>
                {formData.website_url ? (
                  <a href={formData.website_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 font-medium break-all">
                    {formData.website_url}
                  </a>
                ) : (
                  <p className="text-ink-primary font-medium">—</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">LinkedIn</p>
                {formData.linkedin_url ? (
                  <a href={formData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 font-medium break-all">
                    {formData.linkedin_url}
                  </a>
                ) : (
                  <p className="text-ink-primary font-medium">—</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-secondary uppercase mb-1">Pitch Deck</p>
                {formData.pitch_deck_url ? (
                  <a href={formData.pitch_deck_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 font-medium break-all">
                    View Deck
                  </a>
                ) : (
                  <p className="text-ink-primary font-medium">—</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Verification Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-md p-6 border border-surface-2"
          >
            <h3 className="text-lg font-display font-bold text-ink-primary mb-4">Verification Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-primary">KYC Verification</p>
                  <p className="text-xs text-ink-secondary">Know Your Customer</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  formData.kyc_status === 'verified' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {formData.kyc_status}
                </span>
              </div>
              <div className="border-t border-surface-2 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-primary">Identity Verified</p>
                  </div>
                  {formData.identity_verified ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-primary">Bank Verified</p>
                  </div>
                  {formData.bank_verified ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // Edit Mode
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-display font-bold text-ink-primary">Edit Profile</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(false)}
          className="text-ink-secondary hover:text-ink-primary"
        >
          <XMarkIcon className="w-6 h-6" />
        </motion.button>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8 border border-surface-2">
        <div className="space-y-8">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-lg font-display font-bold text-ink-primary mb-6 pb-4 border-b border-surface-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  placeholder="+92..."
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Country"
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Founder Role</label>
                <input
                  type="text"
                  value={formData.founder_role}
                  onChange={(e) => handleInputChange('founder_role', e.target.value)}
                  placeholder="CEO, CTO, etc."
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-primary mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 resize-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div>
            <h3 className="text-lg font-display font-bold text-ink-primary mb-6 pb-4 border-b border-surface-2">
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Your startup name"
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Sector</label>
                <select
                  value={formData.company_sector}
                  onChange={(e) => handleInputChange('company_sector', e.target.value)}
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                >
                  <option value="">Select Sector</option>
                  <option value="Fintech">Fintech</option>
                  <option value="AgriTech">AgriTech</option>
                  <option value="EdTech">EdTech</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="Retail">Retail</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Startup Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleInputChange('stage', e.target.value)}
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                >
                  <option value="seed">Seed</option>
                  <option value="series_a">Series A</option>
                  <option value="series_b">Series B</option>
                  <option value="series_c">Series C</option>
                  <option value="growth">Growth</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Founded Date</label>
                <input
                  type="date"
                  value={formData.founded_date}
                  onChange={(e) => handleInputChange('founded_date', e.target.value)}
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Team Size</label>
                <input
                  type="number"
                  value={formData.team_size}
                  onChange={(e) => handleInputChange('team_size', parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-primary mb-2">Company Description</label>
                <textarea
                  value={formData.company_description}
                  onChange={(e) => handleInputChange('company_description', e.target.value)}
                  placeholder="What does your company do?"
                  rows={4}
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 resize-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Links & Media Section */}
          <div>
            <h3 className="text-lg font-display font-bold text-ink-primary mb-6 pb-4 border-b border-surface-2">
              Links & Media
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Website URL</label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-primary mb-2">Pitch Deck URL</label>
                <input
                  type="url"
                  value={formData.pitch_deck_url}
                  onChange={(e) => handleInputChange('pitch_deck_url', e.target.value)}
                  placeholder="https://drive.google.com/... or dropbox.com/..."
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-ink-primary mb-2">Company Logo URL</label>
                <input
                  type="url"
                  value={formData.company_logo_url}
                  onChange={(e) => handleInputChange('company_logo_url', e.target.value)}
                  placeholder="https://yourcompany.com/logo.png"
                  className="w-full border-2 border-surface-2 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 mt-8 pt-8 border-t border-surface-2">
          <motion.button
            onClick={() => setIsEditing(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 border-2 border-surface-2 rounded-lg text-ink-primary font-semibold hover:bg-surface-1 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleSave}
            disabled={isSaving}
            whileHover={{ scale: isSaving ? 1 : 1.02 }}
            whileTap={{ scale: isSaving ? 1 : 0.98 }}
            className="flex-1 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// Main Component Return
const FounderDashboardRender: React.FC<{
  activeTab: string
  setActiveTab: (tab: string) => void
  startups: Startup[]
  startup: Startup | null
  loading: boolean
  saving: boolean
  showForm: boolean
  setShowForm: (show: boolean) => void
  successMessage: string
  allStartups: any[]
  handleFormSuccess: (data: FormData) => Promise<void>
  handleSubmitProof: (milestoneId: string) => Promise<void>
  refreshUser: () => Promise<void>
  user: any
  navigate: any
  selectStartup: (id: string) => Promise<void>
}> = ({
  activeTab,
  setActiveTab,
  startups,
  startup,
  loading,
  saving,
  showForm,
  setShowForm,
  successMessage,
  allStartups,
  handleFormSuccess,
  handleSubmitProof,
  refreshUser,
  user,
  navigate,
  selectStartup,
}) => {
  return (
    <div className="min-h-screen bg-surface-1 flex">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1">
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
            <StartupsListView 
              startups={startups as Startup[]} 
              onSelect={async (id) => {
                await selectStartup(id)
                setActiveTab('dashboard')
              }}
              onCreateClick={() => setShowForm(true)}
            />
          )}

          {activeTab === 'milestones' && (
            <MilestonesTabView 
              startups={startups as Startup[]} 
              activeStartup={startup} 
              onSelect={selectStartup}
              onSubmitProof={handleSubmitProof}
              proofSubmitting={saving}
            />
          )}

          {activeTab === 'browse' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-display font-bold text-ink-primary mb-2">Browse Startups</h2>
                <p className="text-ink-secondary">Discover other startups and stay updated with the ecosystem</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(allStartups || []).map((s: any, idx: number) => {
                  const fundingPercentage = (s.amount_raised / s.funding_goal) * 100
                  const isOwnStartup = startups?.some((own: any) => own.id === s.id)
                  
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' }}
                      className={`bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                        isOwnStartup 
                          ? 'border-brand-600 shadow-lg' 
                          : 'border-surface-2 hover:border-brand-300'
                      }`}
                    >
                      {/* Your Startup Badge */}
                      {isOwnStartup && (
                        <div className="mb-3 inline-block bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Your Startup
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-ink-primary truncate">{s.name}</h3>
                          <span className="text-xs bg-surface-2 text-ink-secondary px-2 py-1 rounded inline-block mt-2 font-medium">
                            {s.sector}
                          </span>
                        </div>
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ml-2 ${
                          s.status === 'active' ? 'bg-green-500' : 
                          s.status === 'pending' || s.status === 'under_review' ? 'bg-yellow-500' : 
                          'bg-blue-500'
                        }`} />
                      </div>
                      
                      <p className="text-sm text-ink-secondary line-clamp-2 mb-4 h-10">{s.tagline}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-ink-secondary font-medium">Funded</span>
                            <span className="font-semibold text-brand-600">{fundingPercentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-surface-2 rounded-full h-2.5">
                            <div 
                              className="bg-gradient-to-r from-brand-500 to-brand-600 h-2.5 rounded-full" 
                              style={{ width: `${Math.min(fundingPercentage, 100)}%` }} 
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <p className="text-xs text-ink-secondary mb-0.5">Raised</p>
                            <p className="text-sm font-mono font-bold text-ink-primary">Rs {(s.amount_raised / 100000).toFixed(1)}L</p>
                          </div>
                          <div>
                            <p className="text-xs text-ink-secondary mb-0.5">Goal</p>
                            <p className="text-sm font-mono font-bold text-ink-secondary">Rs {(s.funding_goal / 100000).toFixed(1)}L</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 text-xs text-ink-secondary">
                          <span>👥</span>
                          <span>{s.investor_count || 0} investors</span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/startups/${s.id}`)}
                        className="w-full mt-4 py-2.5 bg-brand-50 text-brand-600 rounded-lg font-semibold hover:bg-brand-100 transition-colors text-sm"
                      >
                        View Details
                      </motion.button>
                    </motion.div>
                  )
                })}
              </div>

              {(!allStartups || allStartups.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-ink-secondary mb-4">No startups to browse yet</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <SettingsTabContent user={user} refreshUser={refreshUser} />
          )}
        </div>
      </div>

      {/* Multi-Step Form Modal */}
      <AnimatePresence>
        {showForm && (
          <StartupCreationForm 
            onSuccess={handleFormSuccess} 
            onCancel={() => setShowForm(false)} 
            isSubmitting={saving}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default FounderDashboard
