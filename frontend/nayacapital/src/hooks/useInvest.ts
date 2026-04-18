import { useState, useCallback, useContext } from 'react'
import { api } from '../lib/api'
import { AuthContext } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { USE_MOCK, isRuntimeMockEnabled, useInvestMock } from '../data/useMockData'
import { normalizeInvestmentRow } from '../lib/compat'

interface InvestmentData {
  id: string
  startup_id: string
  amount_pkr?: number
  amount?: number
  equity_percent?: number
  equity_percentage?: number
  investor_id?: string
  created_at: string
  time?: string
  uid?: string
}

interface UseInvestReturn {
  invest: (startupId: string, amountPkr: number) => Promise<InvestmentData | null>
  loading: boolean
  error: string | null
}

export const useInvest = (): UseInvestReturn => {
  // Use mock data if in development mode
  if (USE_MOCK || isRuntimeMockEnabled()) {
    return useInvestMock()
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const authContext = useContext(AuthContext)

  const invest = useCallback(
    async (startupId: string, amountPkr: number): Promise<InvestmentData | null> => {
      try {
        setLoading(true)
        setError(null)

        const { data } = await api.post(`/invest/${startupId}`, {
          amount_pkr: amountPkr,
        })

        const investment = normalizeInvestmentRow(data.investment || data) as InvestmentData

        const equity = investment.equity_percent ?? investment.equity_percentage ?? 0
        toast.success(`✨ Investment successful! You own ${equity.toFixed(3)}% equity`)

        // Update wallet balance in AuthContext if available
        if (authContext?.user && typeof data.new_wallet_balance === 'number') {
          authContext.setUser({
            ...authContext.user,
            wallet_balance: data.new_wallet_balance,
          })
        }

        return investment
      } catch (err: any) {
        const message = err.response?.data?.detail || err.response?.data?.message || 'Investment failed. Please try again.'
        setError(message)

        if (err.response?.status === 401) {
          toast.error('Please log in to invest')
        } else if (err.response?.status === 400) {
          toast.error(message)
        } else if (!navigator.onLine) {
          toast.error('Connection issue. Please check your internet.')
        } else {
          toast.error(message)
        }

        return null
      } finally {
        setLoading(false)
      }
    },
    [authContext]
  )

  return { invest, loading, error }
}
