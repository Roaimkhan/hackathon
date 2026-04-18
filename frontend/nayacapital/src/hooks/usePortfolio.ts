import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { USE_MOCK, isRuntimeMockEnabled, usePortfolioMock } from '../data/useMockData'
import { normalizeInvestmentRow } from '../lib/compat'

interface Investment {
  id: string
  startup_id: string
  startup_name: string
  sector: string
  amount_invested: number
  equity_percentage: number
  status: string
  invested_date: string
}

interface UsePortfolioReturn {
  investments: Investment[]
  totalInvested: number
  totalEquity: number
  loading: boolean
  error: string | null
  refetch: () => void
}

export const usePortfolio = (): UsePortfolioReturn => {
  // Use mock data if in development mode
  if (USE_MOCK || isRuntimeMockEnabled()) {
    return usePortfolioMock()
  }

  const [investments, setInvestments] = useState<Investment[]>([])
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalEquity, setTotalEquity] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data } = await api.get('/portfolio')

      const rows = Array.isArray(data) ? data : data.data || []
      const normalized: Investment[] = rows.map((row: any) => {
        const item = normalizeInvestmentRow(row)
        return {
          id: item.id,
          startup_id: item.startup_id,
          startup_name: item.startup_name,
          sector: item.sector,
          amount_invested: item.amount_pkr || 0,
          equity_percentage: item.equity_percentage || item.equity_percent || 0,
          status: item.status,
          invested_date: item.created_at || new Date().toISOString(),
        }
      })

      setInvestments(normalized)
      setTotalInvested(normalized.reduce((sum, inv) => sum + inv.amount_invested, 0))
      setTotalEquity(normalized.reduce((sum, inv) => sum + inv.equity_percentage, 0))
    } catch (err: any) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'Failed to fetch portfolio'
      setError(message)

      if (err.response?.status === 401) {
        // User not authenticated, this is handled by auth interceptor
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
    fetchPortfolio()
  }, [fetchPortfolio])

  return { investments, totalInvested, totalEquity, loading, error, refetch: fetchPortfolio }
}
