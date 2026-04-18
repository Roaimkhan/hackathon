import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { FRONTEND_ONLY_MODE } from '../lib/runtimeMode'
import { normalizeStartupRow } from '../lib/compat'

interface RealtimeUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  new_record?: any
  old_record?: any
}

interface UseRealtimeStartupReturn {
  isConnected: boolean
  lastUpdate: RealtimeUpdate | null
}

export const useRealtimeStartup = (startupId: string): UseRealtimeStartupReturn => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<RealtimeUpdate | null>(null)

  useEffect(() => {
    if (FRONTEND_ONLY_MODE) {
      setIsConnected(false)
      return
    }

    if (!startupId) return

    let previousAmount = 0
    let mounted = true
    setIsConnected(true)

    const poll = async () => {
      try {
        const { data } = await api.get(`/startups/${startupId}`)
        const currentStartup = normalizeStartupRow(data.data || data)
        const currentAmount = currentStartup.amount_raised || 0

        if (previousAmount > 0 && currentAmount !== previousAmount && mounted) {
          setLastUpdate({
            type: 'UPDATE',
            new_record: currentStartup,
            old_record: { amount_raised: previousAmount },
          })

          if (currentAmount > previousAmount) {
            const difference = currentAmount - previousAmount
            const formattedAmount = (difference / 1000).toFixed(0)
            toast.success(`🔥 Someone just invested Rs ${formattedAmount}K!`, {
              icon: '🚀',
            })
          }
        }

        previousAmount = currentAmount
      } catch {
        // Silent polling failure; page-level hooks handle fetch errors.
      }
    }

    poll()
    const intervalId = window.setInterval(poll, 8000)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
      setIsConnected(false)
    }
  }, [startupId])

  return { isConnected, lastUpdate }
}

// Watch for changes to investor count or funding progress
export const useRealtimeFundingUpdates = (
  startupId: string,
  onAmountRaisedChange?: (newAmount: number, oldAmount: number) => void,
  onInvestorCountChange?: (newCount: number, oldCount: number) => void
) => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (FRONTEND_ONLY_MODE) {
      setIsConnected(false)
      return
    }

    if (!startupId) return

    let previousAmount = 0
    let previousInvestors = 0
    setIsConnected(true)

    const poll = async () => {
      try {
        const { data } = await api.get(`/startups/${startupId}`)
        const currentStartup = normalizeStartupRow(data.data || data)
        const currentAmount = currentStartup.amount_raised || 0
        const currentInvestors = currentStartup.investor_count || currentStartup.investors_count || 0

        if (onAmountRaisedChange && previousAmount > 0 && currentAmount !== previousAmount) {
          onAmountRaisedChange(currentAmount, previousAmount)
        }

        if (onInvestorCountChange && previousInvestors > 0 && currentInvestors !== previousInvestors) {
          onInvestorCountChange(currentInvestors, previousInvestors)
        }

        previousAmount = currentAmount
        previousInvestors = currentInvestors
      } catch {
        // Silent polling failure; page-level hooks handle fetch errors.
      }
    }

    poll()
    const intervalId = window.setInterval(poll, 8000)

    return () => {
      window.clearInterval(intervalId)
      setIsConnected(false)
    }
  }, [startupId, onAmountRaisedChange, onInvestorCountChange])

  return { isConnected }
}
