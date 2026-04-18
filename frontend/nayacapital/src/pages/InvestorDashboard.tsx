import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  HomeIcon,
  BriefcaseIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import { usePortfolio, useWalletTransactions, useWalletDeposit } from '../hooks'

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



interface MetricCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  suffix?: string
  prefix?: string
  decimals?: number
}



const sectorColors: { [key: string]: string } = {
  Fintech: '#EF4444',
  AgriTech: '#10B981',
  EdTech: '#3B82F6',
  HealthTech: '#F59E0B',
  Retail: '#8B5CF6',
}

// Sidebar Component
const Sidebar: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'portfolio', label: 'Portfolio', icon: BriefcaseIcon },
    { id: 'transactions', label: 'Transactions', icon: ArrowsRightLeftIcon },
    { id: 'browse', label: 'Browse Startups', icon: MagnifyingGlassIcon },
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
              onClick={() => {
                if (item.id === 'browse') {
                  navigate('/startups')
                } else {
                  setActiveTab(item.id)
                }
              }}
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
              : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.full_name}</p>
            <p className="text-xs text-brand-200">Investor</p>
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
const MetricCard: React.FC<MetricCardProps & { isLoading?: boolean }> = ({
  label,
  value,
  icon,
  color,
  suffix = '',
  prefix,
  decimals = 0,
  isLoading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
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
        {isLoading ? (
          <div className="h-8 w-24 bg-surface-2 rounded animate-pulse" />
        ) : (
          <>
            <SafeCountUp
              end={value}
              duration={2}
              separator=","
              decimals={decimals}
              prefix={prefix !== undefined ? prefix : suffix === '%' ? '' : 'Rs '}
              suffix={suffix}
            />
          </>
        )}
      </div>
    </motion.div>
  )
}

// Portfolio Tab Content Component
const PortfolioTabContent: React.FC<{ user: any, apiTransactions: any[], apiInvestments: any[], navigate: any }> = ({ user, apiTransactions, apiInvestments, navigate }) => {
  // 1. High-Level Stat Cards
  const walletBalance = user?.wallet_balance || 0
  
  const activeInvestments = useMemo(() => apiInvestments.filter((inv: any) => inv.status === 'active'), [apiInvestments])
  
  const totalPrincipalInvested = useMemo(() => {
    return activeInvestments.reduce((sum: number, inv: any) => sum + (Number(inv.amount_invested) || 0), 0)
  }, [activeInvestments])

  // Mocking 12.5% gain for demonstration
  const projectionMultiplier = 1.125
  const totalPortfolioValue = totalPrincipalInvested * projectionMultiplier
  const netGain = totalPortfolioValue - totalPrincipalInvested

  // Exit & Dividend Tracker
  const realizedGains = useMemo(() => {
    return apiTransactions
      .filter((tx: any) => tx.type === 'return')
      .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0)
  }, [apiTransactions])

  // Chart Data: Growth Over Time
  const chartData = useMemo(() => {
    if (!apiTransactions || apiTransactions.length === 0) return [{ date: 'Start', amount: 0 }]
    const investments = apiTransactions
      .filter((tx: any) => tx.type === 'investment')
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (investments.length === 0) return [{ date: 'Start', amount: 0 }]

    let cumulative = 0
    const growthByMonth = new Map<string, number>()

    investments.forEach((tx: any) => {
      const d = new Date(tx.date)
      const month = d.toLocaleString('default', { month: 'short' })
      cumulative += tx.amount
      growthByMonth.set(month, cumulative)
    })

    return Array.from(growthByMonth.entries()).map(([date, amount]) => ({
      date,
      amount: amount * projectionMultiplier // applying mock growth so the curve isn't just step logic
    }))
  }, [apiTransactions])

  // Asset Allocation Pie Data
  const allocationData = useMemo(() => {
    const sectors = new Map<string, number>()
    activeInvestments.forEach((inv: any) => {
      const sector = inv.sector || 'Other'
      sectors.set(sector, (sectors.get(sector) || 0) + Number(inv.amount_invested))
    })
    return Array.from(sectors.entries()).map(([name, value]) => ({ name, value }))
  }, [activeInvestments])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="mb-2">
        <h2 className="text-3xl font-display font-bold text-ink-primary">My Portfolio</h2>
        <p className="text-ink-secondary">Manage your active investments and track returns</p>
      </div>

      {/* 1. Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-surface-2">
          <p className="text-sm text-ink-secondary font-medium mb-1">Total Portfolio Value</p>
          <p className="text-2xl font-bold text-ink-primary">Rs {totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-surface-2">
          <p className="text-sm text-ink-secondary font-medium mb-1">Principal Invested</p>
          <p className="text-2xl font-bold text-ink-primary">Rs {totalPrincipalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-surface-2 relative overflow-hidden">
          <p className="text-sm text-ink-secondary font-medium mb-1">Net Gain/Loss</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-green-600">+Rs {netGain.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-md mb-0.5">+12.5%</span>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] opacity-5">
            <ArrowUpIcon className="w-24 h-24 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-surface-2">
          <p className="text-sm text-ink-secondary font-medium mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-ink-primary">Rs {walletBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* 2. Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-surface-2">
          <h3 className="text-lg font-bold text-ink-primary mb-4">Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                formatter={(value: any) => [`Rs ${Number(value).toLocaleString()}`, 'Portfolio Value']}
              />
              <Area type="monotone" dataKey="amount" stroke="#16A34A" fill="url(#colorGrowth)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-surface-2">
          <h3 className="text-lg font-bold text-ink-primary mb-4">Asset Allocation</h3>
          {allocationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={sectorColors[entry.name] || '#9CA3AF'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `Rs ${Number(value).toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-ink-secondary">
              No active assets
            </div>
          )}
        </div>
      </div>

      {/* 4. Exit & Dividend Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-1 rounded-2xl p-6 border border-surface-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink-primary">Realized Gains (Dividends)</h3>
            <p className="text-sm text-ink-secondary">Withdrawn or direct revenue share</p>
          </div>
          <p className="text-2xl font-mono font-bold text-brand-600">Rs {realizedGains.toLocaleString()}</p>
        </div>
        <div className="bg-surface-1 rounded-2xl p-6 border border-surface-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink-primary">Projected Annual Returns</h3>
            <p className="text-sm text-ink-secondary">Based on active startups (15% APY Est.)</p>
          </div>
          <p className="text-2xl font-mono font-bold text-ink-primary">Rs {(totalPrincipalInvested * 0.15).toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</p>
        </div>
      </div>

      {/* 3. Active Investments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-surface-2 overflow-hidden">
        <div className="p-6 border-b border-surface-2">
          <h3 className="text-lg font-bold text-ink-primary">Active Investments</h3>
        </div>
        {activeInvestments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-1 border-b border-surface-2">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-ink-secondary">Project</th>
                  <th className="px-6 py-3 text-sm font-semibold text-ink-secondary">Equity Owned</th>
                  <th className="px-6 py-3 text-sm font-semibold text-ink-secondary">Entry Valuation</th>
                  <th className="px-6 py-3 text-sm font-semibold text-ink-secondary">Current Valuation (Est)</th>
                  <th className="px-6 py-3 text-sm font-semibold text-ink-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeInvestments.map((inv: any) => {
                  const percent = Number(inv.equity_percentage)
                  const invested = Number(inv.amount_invested)
                  const entryValuation = percent > 0 ? (invested / (percent / 100)) : 0
                  const currentValuation = entryValuation * projectionMultiplier
                  
                  return (
                    <tr key={inv.id} className="border-b border-surface-2 last:border-0 hover:bg-surface-1 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                            {inv.startup_name?.slice(0, 2).toUpperCase() || 'P'}
                          </div>
                          <div>
                            <p className="font-semibold text-ink-primary whitespace-nowrap">{inv.startup_name || 'Project'}</p>
                            <p className="text-xs text-ink-secondary flex items-center gap-1">
                              <SectorDot sector={inv.sector} /> {inv.sector}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-brand-600 whitespace-nowrap">
                        {percent.toFixed(3)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-secondary whitespace-nowrap">
                        Rs {entryValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600 whitespace-nowrap">
                        Rs {currentValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        <span className="text-xs ml-1 text-green-500 text-opacity-80">↗</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-ink-secondary mb-4">No active investments found.</p>
            <motion.button
              onClick={() => navigate('/startups')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-brand-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
            >
              Browse Startups
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Transactions Tab Content Component
const TransactionsTabContent: React.FC<{ apiTransactions: any[], isLoading: boolean }> = ({ apiTransactions, isLoading }) => {
  const [filter, setFilter] = useState('all')

  const filteredTransactions = useMemo(() => {
    let sorted = [...apiTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    if (filter === 'all') return sorted
    return sorted.filter(tx => tx.type === filter)
  }, [apiTransactions, filter])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-display font-bold text-ink-primary">Transaction History</h2>
          <p className="text-ink-secondary">View all your deposits, investments, and returns.</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {['all', 'deposit', 'investment', 'return', 'fund_release'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                filter === f ? 'bg-brand-600 text-white' : 'bg-white text-ink-secondary border border-surface-2 hover:bg-surface-1'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-surface-2 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-ink-secondary">Loading transactions...</div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-1 border-b border-surface-2">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-ink-secondary">Type & Details</th>
                  <th className="px-6 py-4 text-sm font-semibold text-ink-secondary">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-ink-secondary text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-2">
                {filteredTransactions.map((tx) => {
                  const isDeposit = tx.type === 'deposit'
                  const isReturn = tx.type === 'return'
                  const isPositive = isDeposit || isReturn
                  
                  return (
                    <tr key={tx.id} className="hover:bg-surface-1 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isDeposit ? 'bg-green-50' : isReturn ? 'bg-yellow-50' : tx.type === 'fund_release' ? 'bg-blue-50' : 'bg-red-50'
                          }`}>
                            {isDeposit ? <ArrowDownIcon className="w-5 h-5 text-green-600" /> 
                              : isReturn ? <span className="text-lg">🏆</span> 
                              : tx.type === 'fund_release' ? <span className="text-lg">🏁</span> 
                              : <ArrowUpIcon className="w-5 h-5 text-red-600" />}
                          </div>
                          <div>
                            <p className="font-semibold text-ink-primary capitalize">{tx.type.replace('_', ' ')}</p>
                            <p className="text-sm text-ink-secondary">{tx.description} {tx.startup_name && `(${tx.startup_name})`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-secondary font-mono">
                        {tx.date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className={`font-mono font-bold text-lg ${isPositive ? 'text-green-600' : 'text-ink-primary'}`}>
                          {isPositive ? '+' : '-'}Rs {tx.amount.toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-ink-secondary mb-2">No transactions match the selected filter.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Settings Tab Content Component
const SettingsTabContent: React.FC<{ user: any, refreshUser: any }> = ({ user, refreshUser }) => {
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    try {
      setIsUpdating(true)
      await api.patch('/auth/me', { full_name: fullName })
      await refreshUser()
      alert('Profile updated successfully!')
    } catch (e) {
      alert('Failed to update profile.')
      console.error(e)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 text-left max-w-5xl mx-auto"
    >
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold text-ink-primary">Settings</h2>
        <p className="text-ink-secondary">Manage your account preferences, security, and profile details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Wider for Main Details) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Profile Management */}
          <div className="bg-white rounded-2xl shadow-sm border border-surface-2 p-6">
            <h3 className="text-xl font-bold text-ink-primary mb-4">Profile Management</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                {user?.full_name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-ink-primary truncate">{user?.full_name}</p>
                <p className="text-sm text-ink-secondary truncate">{user?.email}</p>
              </div>
              <div className="ml-auto">
                <span className="bg-gold-100 text-gold-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {user?.role || 'Investor'}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-ink-primary mb-1">Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-surface-1 border border-surface-2 rounded-lg p-3 text-ink-primary focus:outline-none focus:border-brand-600 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-primary mb-1">Email Address</label>
                  <input type="email" value={user?.email || ''} readOnly className="w-full bg-surface-2 border border-surface-2 rounded-lg p-3 text-ink-secondary cursor-not-allowed transition-colors" title="Email address cannot be changed" />
                </div>
                <div className="col-span-1 lg:col-span-2">
                  <label className="block text-sm font-semibold text-ink-primary mb-1">CNIC (National ID)</label>
                  <input type="text" value={user?.cnic || 'Pending verification'} readOnly className="w-full max-w-sm bg-surface-2 border border-surface-2 rounded-lg p-3 text-ink-secondary cursor-not-allowed transition-colors" title="CNIC is locked" />
                </div>
              </div>
              <button 
                onClick={handleUpdate}
                disabled={isUpdating || fullName === user?.full_name}
                className="mt-2 bg-brand-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update Information'}
              </button>
            </div>
          </div>

          {/* 3. Financial & Wallet Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-surface-2 p-6">
            <h3 className="text-xl font-bold text-ink-primary mb-4">Financial & Wallet Setup</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Linked Bank Accounts (Payouts)</label>
                <div className="bg-surface-1 border border-surface-2 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center text-xl">🏛️</div>
                    <div>
                      <p className="font-bold text-ink-primary">Meezan Bank Limited</p>
                      <p className="text-sm text-ink-secondary">**** **** 1234</p>
                    </div>
                  </div>
                  <button className="text-brand-600 font-semibold text-sm hover:underline">Remove</button>
                </div>
                <button className="mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700">+ Add another bank account</button>
              </div>

              <div className="pt-6 border-t border-surface-2">
                <label className="block text-sm font-semibold text-ink-primary mb-2">Tax Information (NTN)</label>
                <p className="text-sm text-ink-secondary mb-3">Required to process automatic dividend withholding taxes.</p>
                <input type="text" placeholder="Enter 7 or 9 digit NTN" className="w-full max-w-sm bg-surface-1 border border-surface-2 rounded-lg p-3 text-ink-primary focus:outline-none focus:border-brand-600 transition-colors" />
              </div>
            </div>
          </div>

          {/* 4. Security & Privacy */}
          <div className="bg-white rounded-2xl shadow-sm border border-surface-2 p-6">
            <h3 className="text-xl font-bold text-ink-primary mb-4">Security</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-ink-primary mb-2">Change Password</label>
                <div className="flex gap-3 max-w-md">
                  <input type="password" placeholder="New password text..." className="flex-1 bg-surface-1 border border-surface-2 rounded-lg p-3 focus:outline-none focus:border-brand-600 transition-colors" />
                  <button className="bg-surface-2 text-ink-primary font-semibold px-6 py-2 rounded-lg hover:bg-surface-3 transition-colors">Update</button>
                </div>
              </div>
              <div className="pt-6 border-t border-surface-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-ink-primary">Two-Factor Authentication (2FA)</p>
                  <p className="text-sm text-ink-secondary">Protect your wallet from unauthorized withdrawals.</p>
                </div>
                <div className="w-12 h-6 bg-brand-600 rounded-full flex items-center justify-end px-1 cursor-pointer transition-colors shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
              <div className="pt-6 border-t border-surface-2">
                <p className="font-bold text-ink-primary mb-2">Active Sessions</p>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-ink-primary">MacBook Pro (Chrome)</p>
                    <p className="text-xs text-ink-secondary">Lahore, PK • Current Session</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Side Panels) */}
        <div className="space-y-8">

          {/* 2. Verification & KYC */}
          <div className="bg-white rounded-2xl shadow-sm border border-surface-2 p-6">
            <h3 className="text-lg font-bold text-ink-primary mb-4">Identity Verification</h3>
            <div className="bg-green-50 border border-green-100 rounded-xl p-6 mb-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                🛡️
              </div>
              <p className="font-bold text-green-800 text-lg">KYC Verified</p>
              <p className="text-sm text-green-600 mt-1">Your identity documents have been approved by NayaCapital.</p>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-surface-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-primary font-medium">Accreditation Status</span>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2 py-1 rounded">Pending review</span>
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Applying for accredited investor status allows you to bypass standard funding limits on high equity valuations.
              </p>
              <button 
                onClick={() => alert('Feature coming soon!')}
                className="w-full mt-2 border border-brand-200 text-brand-600 font-semibold py-2 rounded-lg text-sm hover:bg-brand-50 transition-colors"
               >
                Apply for Accreditation
              </button>
            </div>
          </div>

          {/* 5. Preferences & Notifications */}
          <div className="bg-surface-0 rounded-2xl shadow-sm border border-surface-2 p-6">
            <h3 className="text-lg font-bold text-ink-primary mb-4">Notifications</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-primary">Investment Alerts</p>
                  <p className="text-xs text-ink-secondary">New startups in favorite sectors</p>
                </div>
                {/* Custom toggle style */}
                <div className="w-10 h-5 bg-brand-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-primary">Dividend Pings</p>
                  <p className="text-xs text-ink-secondary">When a startup issues a return</p>
                </div>
                <div className="w-10 h-5 bg-brand-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-3.5 h-3.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="pt-6 border-t border-surface-2">
                <p className="text-sm font-semibold text-ink-primary mb-3">Appearance</p>
                <div className="flex bg-surface-1 border border-surface-2 rounded-lg p-1">
                  <button className="flex-1 text-xs font-bold py-2 rounded bg-white shadow-sm text-brand-600">Light</button>
                  <button className="flex-1 text-xs font-bold py-2 rounded text-ink-secondary hover:text-ink-primary transition-colors">Dark</button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  )
}

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: { [key: string]: { bg: string; text: string; label: string } } = {
    active: { bg: 'bg-green-50', text: 'text-green-700', label: 'Active' },
    funded: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Funded' },
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected' },
    milestone_released: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Milestone Released' },
  }

  const config = statusConfig[status] || statusConfig.active

  return <span className={`${config.bg} ${config.text} text-xs font-semibold px-3 py-1 rounded-full`}>{config.label}</span>
}

// Sector Dot
const SectorDot: React.FC<{ sector: string }> = ({ sector }) => (
  <div
    className="w-3 h-3 rounded-full"
    style={{ backgroundColor: sectorColors[sector] || '#999' }}
  />
)

// Add Funds Modal
const AddFundsModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSuccess: (amount: number) => Promise<void>
  isSubmitting: boolean
}> = ({ isOpen, onClose, onSuccess, isSubmitting }) => {
  const [amount, setAmount] = useState<number | ''>('')

  const presets = [500, 1000, 5000]

  const handleAddFunds = async () => {
    if (!amount || amount < 1) return

    await onSuccess(amount)
    onClose()
    setAmount('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 z-50"
          >
            <h2 className="text-2xl font-display font-bold text-ink-primary mb-2">Add Funds</h2>
            <p className="text-ink-secondary text-sm mb-6">Top up your wallet to start investing</p>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {presets.map((preset) => (
                <motion.button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`py-2 px-3 rounded-lg font-semibold transition-all ${
                    amount === preset
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-2 text-ink-primary hover:bg-surface-3'
                  }`}
                >
                  Rs {preset.toLocaleString()}
                </motion.button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-ink-primary mb-2">
                Custom Amount
              </label>
              <div className="flex items-center border border-surface-3 rounded-lg px-4">
                <span className="text-ink-secondary font-mono text-lg">Rs</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="Enter amount"
                  className="flex-1 bg-transparent outline-none py-3 px-3 text-ink-primary font-mono text-lg"
                  min="1"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-lg border border-surface-3 text-ink-primary font-semibold hover:bg-surface-1 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleAddFunds}
                disabled={!amount || amount < 1 || isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Processing...' : 'Add to Wallet'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Main Component
const InvestorDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    investments: apiInvestments,
    totalInvested,
    totalEquity: equityOwned,
    loading: portfolioLoading,
    refetch: refetchPortfolio,
  } = usePortfolio()
  const {
    transactions: apiTransactions,
    loading: transactionsLoading,
    refetch: refetchTransactions,
  } = useWalletTransactions()
  const { deposit, loading: depositLoading } = useWalletDeposit()
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'dashboard')
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false)

  React.useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Calculate metrics
  const activeInvestments = useMemo(
    () => apiInvestments.filter((inv) => inv.status === 'active').length,
    [apiInvestments]
  )

  const walletBalance = user?.wallet_balance || 0

  const chartData = useMemo(() => {
    if (!apiTransactions || apiTransactions.length === 0) return [{ date: 'Start', amount: 0 }]

    const investments = apiTransactions
      .filter((tx) => tx.type === 'investment')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (investments.length === 0) return [{ date: 'Start', amount: 0 }]

    let cumulative = 0
    const growthByMonth = new Map<string, number>()

    investments.forEach((tx) => {
      const d = new Date(tx.date)
      const month = d.toLocaleString('default', { month: 'short' })
      cumulative += tx.amount
      growthByMonth.set(month, cumulative)
    })

    return Array.from(growthByMonth.entries()).map(([date, amount]) => ({
      date,
      amount,
    }))
  }, [apiTransactions])

  const handleAddFundsSuccess = async (amount: number) => {
    const ok = await deposit(amount)
    if (ok) {
      await refreshUser()
      await refetchTransactions()
      await refetchPortfolio()
    }
  }

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-ink-primary mb-2">
              Good morning, {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-ink-secondary">Here is your portfolio overview</p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="relative">
              <MetricCard
                label="Wallet Balance"
                value={walletBalance}
                icon={<span className="text-2xl">💳</span>}
                color="bg-green-50"
                isLoading={portfolioLoading}
              />
              <motion.button
                onClick={() => setIsAddFundsOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-6 right-6 bg-brand-600 text-white text-xs px-3 py-1 rounded-full font-semibold hover:bg-brand-700 transition-colors"
              >
                + Add Funds
              </motion.button>
            </div>

            <MetricCard
              label="Total Invested"
              value={totalInvested}
              icon={<span className="text-2xl">📊</span>}
              color="bg-blue-50"
              isLoading={portfolioLoading}
            />

            <MetricCard
              label="Active Investments"
              value={activeInvestments}
              icon={<span className="text-2xl">🎯</span>}
              color="bg-purple-50"
              prefix=""
              isLoading={portfolioLoading}
            />

            <MetricCard
              label="Total Equity Owned"
              value={equityOwned}
              icon={<span className="text-2xl">🏆</span>}
              color="bg-yellow-50"
              suffix="%"
              decimals={3}
              isLoading={portfolioLoading}
            />
          </div>

          {/* Portfolio Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md p-6 mb-8"
          >
            <h2 className="text-xl font-display font-bold text-ink-primary mb-6">Portfolio Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => {
                    const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
                    return [`Rs ${numericValue.toLocaleString()}`, 'Amount']
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#16A34A"
                  fill="url(#colorAmount)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Portfolio Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md overflow-hidden mb-8"
          >
            <div className="p-6 border-b border-surface-2">
              <h2 className="text-xl font-display font-bold text-ink-primary">Your Investments</h2>
            </div>

            {apiInvestments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-1 border-b border-surface-2">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-ink-secondary">
                        Startup
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-ink-secondary">
                        Sector
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-ink-secondary">
                        Invested
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-ink-secondary">
                        Equity %
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-ink-secondary">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-ink-secondary">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiInvestments.map((investment, idx) => (
                      <tr
                        key={investment.id}
                        className={`border-b border-surface-2 hover:bg-surface-1 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-surface-1'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-ink-primary">
                          {investment.startup_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-ink-secondary flex items-center gap-2">
                          <SectorDot sector={investment.sector} />
                          {investment.sector}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono font-semibold text-ink-primary">
                          Rs {investment.amount_invested.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono font-semibold text-brand-600">
                          {investment.equity_percentage.toFixed(3)}%
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <StatusBadge status={investment.status} />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <motion.button
                            onClick={() => navigate(`/startups/${investment.startup_id || investment.id}`)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-brand-600 hover:text-brand-700 font-semibold"
                          >
                            View
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-ink-secondary mb-4">No investments yet</p>
                <motion.button
                  onClick={() => navigate('/startups')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-brand-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
                >
                  Browse Startups
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Transactions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-6"
          >
            <h2 className="text-xl font-display font-bold text-ink-primary mb-6">Recent Transactions</h2>

            <div className="space-y-4">
              {apiTransactions.map((tx) => {
                const isDeposit = tx.type === 'deposit'
                const isReturn = tx.type === 'return'

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 pb-4 border-b border-surface-2 last:border-0"
                  >
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isDeposit ? 'bg-green-50' : isReturn ? 'bg-yellow-50' : tx.type === 'fund_release' ? 'bg-blue-50' : 'bg-red-50'
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownIcon className="w-6 h-6 text-green-600" />
                      ) : isReturn ? (
                        <span className="text-xl">🏆</span>
                      ) : tx.type === 'fund_release' ? (
                        <span className="text-xl">🏁</span>
                      ) : (
                        <ArrowUpIcon className="w-6 h-6 text-red-600" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <p className="font-semibold text-ink-primary">
                        {tx.description}
                        {tx.startup_name && ` ${tx.startup_name}`}
                      </p>
                      <p className="text-sm text-ink-secondary">{tx.date}</p>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className={`font-mono text-lg font-bold ${isDeposit || isReturn ? 'text-green-600' : 'text-red-600'}`}>
                        {isDeposit || isReturn ? '+' : '-'}Rs {tx.amount.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
              {transactionsLoading && (
                <p className="text-sm text-ink-secondary">Loading transactions...</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )
    }

    return (
      <motion.div
        key="other"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={activeTab === 'portfolio' || activeTab === 'transactions' || activeTab === 'settings' ? '' : 'text-center py-12'}
      >
        {activeTab === 'portfolio' ? (
          <PortfolioTabContent user={user} apiTransactions={apiTransactions} apiInvestments={apiInvestments} navigate={navigate} />
        ) : activeTab === 'transactions' ? (
          <TransactionsTabContent apiTransactions={apiTransactions} isLoading={transactionsLoading} />
        ) : activeTab === 'settings' ? (
          <SettingsTabContent user={user} refreshUser={refreshUser} />
        ) : (
          <>
            <p className="text-ink-secondary text-lg mb-4">
              Unhandled tab rendering state.
            </p>
          </>
        )}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-1 flex items-start">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>

      {/* Add Funds Modal */}
      <AddFundsModal
        isOpen={isAddFundsOpen}
        onClose={() => setIsAddFundsOpen(false)}
        onSuccess={handleAddFundsSuccess}
        isSubmitting={depositLoading}
      />
    </div>
  )
}

export default InvestorDashboard
