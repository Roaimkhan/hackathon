// Custom hooks for Supabase + FastAPI integration

// Startup hooks
export { useStartups, useStartup } from './useStartups'

// Investment hooks
export { useInvest } from './useInvest'

// Portfolio hooks
export { usePortfolio } from './usePortfolio'

// Milestone hooks
export {
  useMilestones,
  useSubmitProof,
  useApproveMilestone,
  useRejectMilestone,
} from './useMilestones'

// Wallet hooks
export { useWalletDeposit, useWalletTransactions, useWalletBalance } from './useWallet'

// Founder hooks
export { useFounder } from './useFounder'

// Real-time hooks
export { useRealtimeStartup, useRealtimeFundingUpdates } from './useRealtimeStartup'
