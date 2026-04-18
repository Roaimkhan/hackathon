import { useState, useCallback, useEffect } from 'react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { USE_MOCK, isRuntimeMockEnabled, useWalletDepositMock, useWalletTransactionsMock, useWalletBalanceMock } from '../data/useMockData'
import { normalizeTransactionRow } from '../lib/compat'

interface Transaction {
  id: string
  type: 'deposit' | 'investment' | 'return' | 'fund_release'
  amount: number
  description: string
  date: string
  startup_name?: string
}

interface UseWalletDepositReturn {
  deposit: (amount: number) => Promise<boolean>
  loading: boolean
  error: string | null
}

interface UseWalletTransactionsReturn {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  refetch: () => void
}

// Deposit funds to wallet
export const useWalletDeposit = (): UseWalletDepositReturn => {
  // Use mock data if in development mode
  if (USE_MOCK || isRuntimeMockEnabled()) {
    return useWalletDepositMock()
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deposit = useCallback(
    async (amount: number): Promise<boolean> => {
      try {
        setLoading(true)
        setError(null)

        if (amount < 1) {
          toast.error('Minimum deposit is Rs 1')
          return false
        }

        const { data } = await api.post('/wallet/deposit', {
          amount_pkr: amount,
        })

        const newBalance = data.new_balance || data.new_wallet_balance || 0

        toast.success(`✓ Rs ${amount.toLocaleString()} added to your wallet`)

        // Update wallet balance in localStorage
        localStorage.setItem('user_wallet_balance', newBalance.toString())

        // Note: AuthContext would need to provide a method to update wallet
        // For now, we store in localStorage and let AuthContext fetch it on next load

        return true
      } catch (err: any) {
        const message = err.response?.data?.detail || err.response?.data?.message || 'Deposit failed. Please try again.'
        setError(message)

        if (err.response?.status === 401) {
          toast.error('Please log in to deposit funds')
        } else if (err.response?.status === 400) {
          toast.error(message)
        } else if (!navigator.onLine) {
          toast.error('Connection issue. Please check your internet.')
        } else {
          toast.error(message)
        }

        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { deposit, loading, error }
}

// Fetch wallet transactions
export const useWalletTransactions = (): UseWalletTransactionsReturn => {
  // Use mock data if in development mode
  if (USE_MOCK || isRuntimeMockEnabled()) {
    return useWalletTransactionsMock()
  }

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data } = await api.get('/wallet/transactions')
      const rows = Array.isArray(data) ? data : data.data || []
      const normalized: Transaction[] = rows.map((row: any) => {
        const item = normalizeTransactionRow(row)
        return {
          id: item.id,
          type: item.type,
          amount: item.amount_pkr || 0,
          description: item.reference || item.type || 'Transaction',
          date: item.created_at || new Date().toISOString(),
        }
      })
      setTransactions(normalized)
    } catch (err: any) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'Failed to fetch transactions'
      setError(message)

      if (err.response?.status === 401) {
        // Handled by auth interceptor
      } else if (!navigator.onLine) {
        toast.error('Connection issue. Please check your internet.')
      } else {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, loading, error, refetch: fetchTransactions }
}

// Get current wallet balance
export const useWalletBalance = () => {
  // Use mock data if in development mode
  if (USE_MOCK || isRuntimeMockEnabled()) {
    return useWalletBalanceMock()
  }

  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data } = await api.get('/auth/me')

      setBalance(data.wallet_balance ?? data.balance ?? 0)
    } catch (err: any) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'Failed to fetch wallet balance'
      setError(message)

      if (err.response?.status !== 401) {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return { balance, loading, error, refetch: fetchBalance }
}
