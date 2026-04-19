import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { USE_MOCK, isRuntimeMockEnabled } from '../data/useMockData'
import { normalizeMilestoneRow, normalizeStartupRow } from '../lib/compat'

interface FounderMilestone {
	id: string
	title: string
	description: string
	fund_percentage: number
	status: 'pending' | 'approved' | 'rejected'
	rejection_reason?: string
	order_index?: number
}

interface FounderStartup {
	id: string
	name: string
	sector: string
	tagline: string
	funding_goal: number
	amount_raised: number
	equity_offered: number
	status: string
	story?: string
	milestones: FounderMilestone[]
	investor_count: number
}

interface CreateStartupPayload {
	name: string
	tagline: string
	sector: string
	story: string
	funding_goal: number
	equity_offered: number
	pitch_deck_url?: string
	milestones: Array<{
		title: string
		description: string
		fund_percentage: number
	}>
}

const mapSectorToBackend = (sector: string) => {
	const normalized = sector.trim().toLowerCase()

	if (normalized === 'agritech' || normalized === 'agri') return 'Agri'
	if (normalized === 'fintech') return 'Fintech'
	if (normalized === 'edtech') return 'EdTech'
	if (normalized === 'healthtech' || normalized === 'health') return 'Health'
	if (normalized === 'retail') return 'Retail'
	return 'Other'
}

const toFounderStartup = (data: any): FounderStartup => ({
	id: normalizeStartupRow(data).id,
	name: normalizeStartupRow(data).name,
	sector: normalizeStartupRow(data).sector,
	tagline: normalizeStartupRow(data).tagline,
	funding_goal: normalizeStartupRow(data).funding_goal || 0,
	amount_raised: normalizeStartupRow(data).amount_raised || 0,
	equity_offered: normalizeStartupRow(data).equity_offered || 0,
	status: normalizeStartupRow(data).status || 'pending',
	story: normalizeStartupRow(data).story,
	milestones: (normalizeStartupRow(data).milestones || []).map((m: any) => normalizeMilestoneRow(m)),
	investor_count: normalizeStartupRow(data).investor_count || 0,
})

export const useFounder = () => {
	const [startups, setStartups] = useState<FounderStartup[]>([])
	const [startup, setStartup] = useState<FounderStartup | null>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchDetailedStartup = async (id: string) => {
		const details = await api.get(`/startups/${id}`)
		return toFounderStartup(details.data)
	}

	const refetch = useCallback(async () => {
		if (USE_MOCK || isRuntimeMockEnabled()) {
			setLoading(false)
			return
		}

		try {
			setLoading(true)
			setError(null)

			const { data } = await api.get('/startups/mine')
			const rows = (Array.isArray(data) ? data : data?.data || []).map(normalizeStartupRow)
			const mappedStartups = rows.map((r: any) => toFounderStartup(r))

			setStartups(mappedStartups)

			if (!rows.length) {
				setStartup(null)
				return
			}

			// If we already have a selected startup, re-fetch its details
			// Otherwise default to the newest one
			const targetId = startup?.id || rows[0].id
			const detailed = await fetchDetailedStartup(targetId)
			setStartup(detailed)
		} catch (err: any) {
			const message = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to fetch founder startup'
			setError(message)
			if (err?.response?.status !== 401) {
				toast.error(message)
			}
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		refetch()
	}, [refetch])

	const selectStartup = async (id: string) => {
		try {
			setLoading(true)
			const detailed = await fetchDetailedStartup(id)
			setStartup(detailed)
		} catch (error) {
			console.error('Failed to select startup:', error)
			toast.error('Failed to load startup details')
		} finally {
			setLoading(false)
		}
	}

	const createStartup = useCallback(async (payload: CreateStartupPayload) => {
		if (USE_MOCK || isRuntimeMockEnabled()) {
			return null
		}

		try {
			setSaving(true)
			setError(null)

			const startupBody = {
				name: payload.name,
				tagline: payload.tagline,
				sector: mapSectorToBackend(payload.sector),
				story: payload.story,
				funding_goal: payload.funding_goal,
				equity_offered: payload.equity_offered,
				pitch_deck_url: payload.pitch_deck_url || null,
			}

			const createResponse = await api.post('/startups', startupBody)
			const created = normalizeStartupRow(createResponse.data)

			if (payload.milestones.length > 0) {
				await api.post(
					`/startups/${created.id}/milestones`,
					payload.milestones.map((m, index) => ({
						title: m.title,
						description: m.description,
						fund_percentage: m.fund_percentage,
						order_index: index + 1,
					}))
				)
			}

			await refetch()
			toast.success('Startup submitted successfully')
			return created
		} catch (err: any) {
			const message = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to create startup'
			setError(message)
			toast.error(message)
			return null
		} finally {
			setSaving(false)
		}
	}, [refetch])

	const submitMilestoneProof = useCallback(async (milestoneId: string) => {
		if (USE_MOCK || isRuntimeMockEnabled()) {
			return false
		}

		try {
			setSaving(true)
			setError(null)

			const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
			await api.post(`/milestones/${milestoneId}/submit`, {
				proof_url: `proof-${milestoneId}-${timestamp}`,
			})

			await refetch()
			toast.success('Milestone proof submitted')
			return true
		} catch (err: any) {
			const message = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to submit milestone proof'
			setError(message)
			toast.error(message)
			return false
		} finally {
			setSaving(false)
		}
	}, [refetch])

	return {
		startups,
		startup,
		loading,
		saving,
		error,
		refetch,
		createStartup,
		submitMilestoneProof,
		selectStartup,
	}
}
