import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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

interface PortfolioChartData {
  date: string
  amount: number
}

interface MetricCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  suffix?: string
  decimals?: number
}

const mockChartData: PortfolioChartData[] = [
  { date: 'Jan', amount: 50000 },
  { date: 'Feb', amount: 80000 },
  { date: 'Mar', amount: 145000 },
  { date: 'Apr', amount: 145000 },
  { date: 'May', amount: 165000 },
]

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
              prefix={suffix === '%' ? '' : 'Rs '}
              suffix={suffix}
            />
          </>
        )}
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
  const { user } = useAuth()
  const navigate = useNavigate()
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
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false)

  // Calculate metrics
  const activeInvestments = useMemo(
    () => apiInvestments.filter((inv) => inv.status === 'active').length,
    [apiInvestments]
  )

  const walletBalance = user?.wallet_balance || 0

  const handleAddFundsSuccess = async (amount: number) => {
    const ok = await deposit(amount)
    if (ok) {
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
              <AreaChart data={mockChartData}>
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
        className="text-center py-12"
      >
        <p className="text-ink-secondary text-lg mb-4">
          {activeTab === 'portfolio' && 'Portfolio section coming soon'}
          {activeTab === 'transactions' && 'Full transactions history coming soon'}
          {activeTab === 'browse' && 'Redirecting to browse startups...'}
          {activeTab === 'settings' && 'Settings coming soon'}
        </p>
        {activeTab === 'browse' && (
          <motion.button
            onClick={() => navigate('/startups')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-brand-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
          >
            Go to Browse
          </motion.button>
        )}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-1">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="ml-60">
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
