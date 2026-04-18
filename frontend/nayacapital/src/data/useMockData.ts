// ============================================================
// MOCK DATA WRAPPER - DEVELOPMENT MODE
// ============================================================
// Set USE_MOCK = false when backend is ready
// When true, all hooks return mock data with 500ms artificial delay

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export { USE_MOCK }

export const isRuntimeMockEnabled = () => {
  if (USE_MOCK) return true

  const token = localStorage.getItem('naya_token')
  const authMode = localStorage.getItem('naya_auth_mode')
  return authMode === 'mock' || Boolean(token && token.startsWith('mock-token-'))
}

// ============================================================
// UTILITY FUNCTION: Simulate API delay
// ============================================================

export const simulateNetworkDelay = (ms: number = 500) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ============================================================
// WRAPPER HOOK FACTORY
// ============================================================
// This intercepts hook calls and returns mock data when USE_MOCK is true

import { useState, useEffect, useCallback } from 'react'
import {
  MOCK_STARTUPS,
  MOCK_MILESTONES,
  MOCK_PORTFOLIO,
  MOCK_USER,
  MOCK_TRANSACTIONS,
  MOCK_KYC_USERS,
  MOCK_ADMIN_STATS,
} from './mockData'
import type { Startup, Milestone, Investment, Transaction, KYCUser } from './mockData'

// ============================================================
// 1. MOCK useStartups
// ============================================================

export function useStartupsMock() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStartups = useCallback(async () => {
    if (!isRuntimeMockEnabled()) return { startups: [], loading: false, error: null, refetch: () => {} }

    try {
      setLoading(true)
      setError(null)
      await simulateNetworkDelay()
      setStartups([...MOCK_STARTUPS])
    } catch (err) {
      setError('Failed to fetch startups')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStartups()
  }, [fetchStartups])

  return { startups, loading, error, refetch: fetchStartups }
}

// ============================================================
// 2. MOCK useStartup (single)
// ============================================================

export function useStartupMock(id: string) {
  const [startup, setStartup] = useState<Startup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStartup = useCallback(async () => {
    if (!isRuntimeMockEnabled() || !id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      await simulateNetworkDelay()
      const found = MOCK_STARTUPS.find((s) => s.id === id)
      if (!found) {
        throw new Error('Startup not found')
      }
      setStartup({ ...found })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchStartup()
  }, [fetchStartup])

  return { startup, loading, error, refetch: fetchStartup }
}

// ============================================================
// 3. MOCK usePortfolio
// ============================================================

export function usePortfolioMock() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalEquity, setTotalEquity] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolio = useCallback(async () => {
    if (!isRuntimeMockEnabled()) return

    try {
      setLoading(true)
      setError(null)
      await simulateNetworkDelay()

      setInvestments([...MOCK_PORTFOLIO])
      const totalInv = MOCK_PORTFOLIO.reduce((sum, inv) => sum + inv.amount_invested, 0)
      const totalEq = MOCK_PORTFOLIO.reduce((sum, inv) => sum + inv.equity_percentage, 0)

      setTotalInvested(totalInv)
      setTotalEquity(totalEq)
    } catch (err) {
      setError('Failed to fetch portfolio')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  return { investments, totalInvested, totalEquity, loading, error, refetch: fetchPortfolio }
}

// ============================================================
// 4. MOCK useMilestones
// ============================================================

export function useMilestonesMock(startupId: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMilestones = useCallback(async () => {
    if (!isRuntimeMockEnabled() || !startupId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      await simulateNetworkDelay()

      const milestones = MOCK_MILESTONES.filter((m) => m.startup_id === startupId)
      setMilestones([...milestones])
    } catch (err) {
      setError('Failed to fetch milestones')
    } finally {
      setLoading(false)
    }
  }, [startupId])

  useEffect(() => {
    fetchMilestones()
  }, [fetchMilestones])

  return { milestones, loading, error, refetch: fetchMilestones }
}

// ============================================================
// 5. MOCK useInvest
// ============================================================

export function useInvestMock() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const invest = useCallback(async (startupId: string, amountPkr: number) => {
    if (!isRuntimeMockEnabled()) return null

    try {
      setLoading(true)
      setError(null)
      await simulateNetworkDelay(800) // Slightly longer for payment processing

      // Mock: Calculate equity
      const startup = MOCK_STARTUPS.find((s) => s.id === startupId)
      if (!startup) throw new Error('Startup not found')

      const equityPercentage = (amountPkr / startup.funding_goal) * startup.equity_offered

      return {
        id: `inv-${Date.now()}`,
        startup_id: startupId,
        amount: amountPkr,
        equity_percentage: equityPercentage,
        status: 'pending',
        created_at: new Date().toISOString(),
      }
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { invest, loading, error }
}

// ============================================================
// 6. MOCK useWalletBalance
// ============================================================

export function useWalletBalanceMock() {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!isRuntimeMockEnabled()) return

    try {
      setLoading(true)
      setError(null)
      await simulateNetworkDelay()
      setBalance(MOCK_USER.wallet_balance)
    } catch (err) {
      setError('Failed to fetch balance')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return { balance, loading, error, refetch: fetchBalance }
}

// ============================================================
// 7. MOCK useWalletTransactions
// ============================================================

export function useWalletTransactionsMock() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!isRuntimeMockEnabled()) return

    try {
      setLoading(true)
      setError(null)
      await simulateNetworkDelay()
      setTransactions([...MOCK_TRANSACTIONS])
    } catch (err) {
      setError('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, loading, error, refetch: fetchTransactions }
}

// ============================================================
// 8. MOCK useWalletDeposit
// ============================================================

export function useWalletDepositMock() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deposit = useCallback(async (amount: number) => {
    if (!isRuntimeMockEnabled()) return false

    try {
      setLoading(true)
      setError(null)

      if (amount < 1) {
        throw new Error('Minimum deposit is Rs 1')
      }

      await simulateNetworkDelay(600) // Payment processing delay

      // Mock: Update localStorage
      const currentBalance = parseFloat(localStorage.getItem('user_wallet_balance') || '0')
      const newBalance = currentBalance + amount
      localStorage.setItem('user_wallet_balance', newBalance.toString())

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { deposit, loading, error }
}

// ============================================================
// 9. MOCK useSubmitProof
// ============================================================

export function useSubmitProofMock() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitProof = useCallback(async (milestoneId: string, _file: File) => {
    if (!isRuntimeMockEnabled()) return false

    try {
      setLoading(true)
      setError(null)
      await simulateNetworkDelay(1000) // File upload delay

      // Mock: Update milestone status
      const milestone = MOCK_MILESTONES.find((m) => m.id === milestoneId)
      if (milestone) {
        milestone.status = 'submitted'
      }

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { submitProof, loading, error }
}

// ============================================================
// 10. MOCK useApproveMilestone
// ============================================================

export function useApproveMilestoneMock() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const approveMilestone = useCallback(async (milestoneId: string) => {
    if (!isRuntimeMockEnabled()) return false

    try {
      setLoading(true)
      setError(null)
      await simulateNetworkDelay(700)

      // Mock: Update milestone status
      const milestone = MOCK_MILESTONES.find((m) => m.id === milestoneId)
      if (milestone) {
        milestone.status = 'approved'
      }

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { approveMilestone, loading, error }
}

// ============================================================
// 11. MOCK useRejectMilestone
// ============================================================

export function useRejectMilestoneMock() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rejectMilestone = useCallback(async (milestoneId: string, reason: string) => {
    if (!isRuntimeMockEnabled()) return false

    try {
      setLoading(true)
      setError(null)
      await simulateNetworkDelay(500)

      // Mock: Update milestone status
      const milestone = MOCK_MILESTONES.find((m) => m.id === milestoneId)
      if (milestone) {
        milestone.status = 'rejected'
        milestone.rejection_reason = reason
      }

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { rejectMilestone, loading, error }
}

// ============================================================
// 12. MOCK ADMIN FUNCTIONS
// ============================================================

export function useAdminStatsMock() {
  const [stats, setStats] = useState(MOCK_ADMIN_STATS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      if (!isRuntimeMockEnabled()) return
      await simulateNetworkDelay()
      setStats(MOCK_ADMIN_STATS)
      setLoading(false)
    }
    fetch()
  }, [])

  return { stats, loading }
}

export function useAdminKYCListMock() {
  const [users, setUsers] = useState<KYCUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      if (!isRuntimeMockEnabled()) return
      await simulateNetworkDelay()
      setUsers([...MOCK_KYC_USERS])
      setLoading(false)
    }
    fetch()
  }, [])

  return { users, loading }
}

// ============================================================
// SWITCHING BETWEEN MOCK AND REAL
// ============================================================
// To use mock data in your hooks:
//
// 1. In useStartups.ts, add at the top:
//    import { USE_MOCK, useStartupsMock } from '../data/useMockData'
//
// 2. Modify the hook to check USE_MOCK first:
//    export const useStartups = (filters?: StartupFilters) => {
//      if (USE_MOCK) {
//        return useStartupsMock()
//      }
//      // ... real API code
//    }
//
// 3. When backend is ready, just set USE_MOCK = false in useMockData.ts
//
// Frontend will automatically switch to real API calls!

export const MOCK_SETUP_INSTRUCTIONS = `
=== MOCK DATA SETUP FOR HOOKS ===

To enable mock data, update each hook like this:

// In src/hooks/useStartups.ts
import { USE_MOCK, useStartupsMock } from '../data/useMockData'

export const useStartups = (filters?: StartupFilters) => {
  if (USE_MOCK) return useStartupsMock()
  // ... real API code
}

// In src/hooks/usePortfolio.ts
import { USE_MOCK, usePortfolioMock } from '../data/useMockData'

export const usePortfolio = () => {
  if (USE_MOCK) return usePortfolioMock()
  // ... real API code
}

// Do this for all hooks!

// When backend is ready, just change in useMockData.ts:
const USE_MOCK = false

// Frontend will automatically use real API calls!
`
