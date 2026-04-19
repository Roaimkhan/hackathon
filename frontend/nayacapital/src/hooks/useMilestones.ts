import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { USE_MOCK, isRuntimeMockEnabled, useMilestonesMock, useSubmitProofMock, useApproveMilestoneMock, useRejectMilestoneMock } from '../data/useMockData'
import { normalizeMilestoneRow } from '../lib/compat'

interface Milestone {
  id: string
  startup_id: string
  title: string
  description?: string
  fund_percentage: number
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  created_at?: string
}

interface UseMilestonesReturn {
  milestones: Milestone[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void> | void
}

interface UseSubmitProofReturn {
  submitProof: (milestoneId: string, file: File) => Promise<boolean>
  loading: boolean
  error: string | null
}

interface UseApproveMilestoneReturn {
  approveMilestone: (milestoneId: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

// Fetch milestones for a startup
export const useMilestones = (startupId: string): UseMilestonesReturn => {
  // Use mock data if in development mode
  if (USE_MOCK || isRuntimeMockEnabled()) {
    return useMilestonesMock(startupId)
  }

  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMilestones = useCallback(async () => {
    if (!startupId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data } = await api.get(`/startups/${startupId}/milestones`)
      const rows = Array.isArray(data.data || data) ? data.data || data : []
      setMilestones(rows.map(normalizeMilestoneRow))
    } catch (err: any) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'Failed to fetch milestones'
      setError(message)

      if (err.response?.status !== 401) {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }, [startupId])

  useEffect(() => {
    fetchMilestones()
  }, [fetchMilestones])

  return { milestones, loading, error, refetch: fetchMilestones }
}

// Submit proof for a milestone
export const useSubmitProof = (): UseSubmitProofReturn => {
  // Use mock data if in development mode
  if (USE_MOCK || isRuntimeMockEnabled()) {
    return useSubmitProofMock()
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitProof = useCallback(async (milestoneId: string, file: File): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { data } = await api.post(`/milestones/${milestoneId}/submit`, {
        proof_url: file.name || 'proof-submitted',
      })

      const amountReleased = data.release_amount || 0
      toast.success(`✓ Milestone Completed! Rs ${amountReleased.toLocaleString()} released to your wallet`)
      return true
    } catch (err: any) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'Failed to submit proof'
      setError(message)

      if (err.response?.status === 401) {
        toast.error('Please log in to submit proof')
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
  }, [])

  return { submitProof, loading, error }
}

// Admin: Approve milestone and release funds
export const useApproveMilestone = (): UseApproveMilestoneReturn => {
  // Use mock data if in development mode
  if (USE_MOCK || isRuntimeMockEnabled()) {
    return useApproveMilestoneMock()
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const approveMilestone = useCallback(async (milestoneId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { data } = await api.post(`/milestones/${milestoneId}/approve`)

      const amountReleased = data.release_amount || 0
      toast.success(
        `✓ Milestone approved! Rs ${amountReleased.toLocaleString()} released to founder`
      )

      return true
    } catch (err: any) {
      const message = err.response?.data?.detail || err.response?.data?.message || 'Failed to approve milestone'
      setError(message)

      if (err.response?.status === 401) {
        toast.error('Unauthorized: Admin access required')
      } else if (err.response?.status === 403) {
        toast.error('You do not have permission to approve milestones')
      } else if (!navigator.onLine) {
        toast.error('Connection issue. Please check your internet.')
      } else {
        toast.error(message)
      }

      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { approveMilestone, loading, error }
}

// Admin: Reject milestone
export const useRejectMilestone = () => {
  // Use mock data if in development mode
  if (USE_MOCK || isRuntimeMockEnabled()) {
    return useRejectMilestoneMock()
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rejectMilestone = useCallback(
    async (milestoneId: string, reason: string): Promise<boolean> => {
      try {
        setLoading(true)
        setError(null)

        await api.post(`/milestones/${milestoneId}/reject`, {
          reason,
        })

        toast.error('Milestone rejected')
        return true
      } catch (err: any) {
        const message = err.response?.data?.detail || err.response?.data?.message || 'Failed to reject milestone'
        setError(message)
        toast.error(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { rejectMilestone, loading, error }
}
