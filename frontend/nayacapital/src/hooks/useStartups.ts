import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { USE_MOCK, isRuntimeMockEnabled, useStartupsMock, useStartupMock } from '../data/useMockData'
import { normalizeStartupRow } from '../lib/compat'

interface Startup {
  id: string
  name: string
  sector: string
  tagline: string
  funding_goal: number
  amount_raised: number
  equity_offered: number
  status: 'active' | 'funded' | 'closing-soon' | string
  investor_count?: number
  min_investment?: number
  founder_name?: string
  founder_avatar?: string
  story?: string
  team_size?: number
}

interface StartupFilters {
  sector?: string
  sort?: string
  search?: string
}

interface UseStartupsReturn {
  startups: Startup[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseStartupReturn {
  startup: Startup | null
  loading: boolean
  error: string | null
  refetch: () => void
}

// Fetch all startups with optional filters
export const useStartups = (filters?: StartupFilters): UseStartupsReturn => {
  // Use mock data if in development mode
  if (USE_MOCK || isRuntimeMockEnabled()) {
    return useStartupsMock()
  }

  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStartups = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      const endpoint = params.toString() ? `/startups?${params.toString()}` : '/startups'
      const { data } = await api.get(endpoint)

      const baseList: Startup[] = (Array.isArray(data) ? data : data.data || []).map(normalizeStartupRow)
      let nextList = [...baseList]

      if (filters?.sector && filters.sector !== 'all') {
        nextList = nextList.filter(
          (s) => (s.sector || '').toLowerCase() === filters.sector?.toLowerCase()
        )
      }

      if (filters?.search) {
        const q = filters.search.toLowerCase()
        nextList = nextList.filter(
          (s) =>
            (s.name || '').toLowerCase().includes(q) ||
            (s.tagline || '').toLowerCase().includes(q) ||
            (s.story || '').toLowerCase().includes(q)
        )
      }

      if (filters?.sort === 'most-funded') {
        nextList.sort((a, b) => b.amount_raised - a.amount_raised)
      } else if (filters?.sort === 'closing-soon') {
        nextList.sort((a, b) => (a.funding_goal - a.amount_raised) - (b.funding_goal - b.amount_raised))
      } else if (filters?.sort === 'min-investment') {
        nextList.sort((a, b) => (a.min_investment || 0) - (b.min_investment || 0))
      }

      setStartups(nextList)
    } catch (err: any) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'Failed to fetch startups'
      setError(message)
      if (err.response?.status !== 401) {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchStartups()
  }, [fetchStartups])

  return { startups, loading, error, refetch: fetchStartups }
}

// Fetch single startup by ID
export const useStartup = (id: string): UseStartupReturn => {
  // Use mock data if in development mode
  if (USE_MOCK || isRuntimeMockEnabled()) {
    return useStartupMock(id)
  }

  const [startup, setStartup] = useState<Startup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStartup = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data } = await api.get(`/startups/${id}`)
      setStartup(normalizeStartupRow(data.data || data))
    } catch (err: any) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'Failed to fetch startup'
      setError(message)
      if (err.response?.status !== 401) {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchStartup()
  }, [fetchStartup])

  return { startup, loading, error, refetch: fetchStartup }
}
