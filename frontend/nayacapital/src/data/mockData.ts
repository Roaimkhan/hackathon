// ============================================================
// MOCK DATA FOR HACKATHON DEMO & DEVELOPMENT
// ============================================================

export interface Startup {
  id: string
  name: string
  sector: string
  tagline: string
  funding_goal: number
  amount_raised: number
  equity_offered: number
  status: 'active' | 'funded' | 'closing-soon'
  investor_count: number
  min_investment?: number
  story?: string
  founder_name?: string
  founder_avatar?: string
  team_size?: number
}

export interface Milestone {
  id: string
  startup_id: string
  title: string
  description?: string
  fund_percentage: number
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  rejection_reason?: string
  created_at?: string
}

export interface Investment {
  id: string
  startup_id: string
  startup_name: string
  sector: string
  amount_invested: number
  equity_percentage: number
  status: string
  invested_date: string
}

export interface MockUser {
  id: string
  full_name: string
  email: string
  role: 'investor' | 'founder' | 'admin'
  kyc_status: 'pending' | 'approved' | 'rejected'
  wallet_balance: number
  avatar?: string
}

export interface Transaction {
  id: string
  type: 'deposit' | 'investment' | 'return' | 'fund_release'
  amount: number
  description: string
  date: string
  startup_name?: string
}

export interface KYCUser {
  id: string
  name: string
  email: string
  cnic: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_date: string
  verified_date?: string
}

export interface AdminStats {
  total_users: number
  pending_kyc: number
  pending_startups: number
  active_startups: number
  total_escrow: number
  total_transactions: number
}

// ============================================================
// 1. MOCK STARTUPS
// ============================================================

export const MOCK_STARTUPS: Startup[] = [
  {
    id: 'zaraa-001',
    name: 'ZaraaFarm',
    sector: 'AgriTech',
    tagline: 'Connecting 50,000 farmers to modern markets via mobile',
    funding_goal: 2500000,
    amount_raised: 1915000,
    equity_offered: 15,
    status: 'active',
    investor_count: 234,
    min_investment: 50000,
    founder_name: 'Ahmed Hassan',
    founder_avatar: 'AH',
    team_size: 12,
    story: `ZaraaFarm is revolutionizing agriculture in Pakistan through cutting-edge AI and IoT technology.`,
  },
  {
    id: 'edu-002',
    name: 'EduPath',
    sector: 'EdTech',
    tagline: 'Affordable skill courses for Tier-2 Pakistan cities',
    funding_goal: 5000000,
    amount_raised: 1180000,
    equity_offered: 12,
    status: 'active',
    investor_count: 89,
    min_investment: 100000,
    founder_name: 'Fatima Malik',
    founder_avatar: 'FM',
    team_size: 8,
    story: `EduPath is democratizing technical education for Pakistan's underserved cities.`,
  },
  {
    id: 'dawa-003',
    name: 'DawaConnect',
    sector: 'HealthTech',
    tagline: 'Last-mile pharmacy delivery & telemedicine for rural Pakistan',
    funding_goal: 3000000,
    amount_raised: 890000,
    equity_offered: 18,
    status: 'active',
    investor_count: 156,
    min_investment: 75000,
    founder_name: 'Dr. Hassan Khan',
    founder_avatar: 'HK',
    team_size: 15,
    story: `DawaConnect provides affordable healthcare to rural communities.`,
  },
]

// ============================================================
// 2. MOCK MILESTONES
// ============================================================

export const MOCK_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    startup_id: 'zaraa-001',
    title: 'MVP Mobile App Launch',
    description: 'Launch beta version of farmer app with core features',
    fund_percentage: 25,
    status: 'approved',
    created_at: '2024-01-15',
  },
  {
    id: 'm2',
    startup_id: 'zaraa-001',
    title: 'Farmer Onboarding: 5,000 users',
    description: 'Successfully onboard 5,000 farmers to platform',
    fund_percentage: 50,
    status: 'approved',
    created_at: '2024-02-20',
  },
  {
    id: 'm3',
    startup_id: 'zaraa-001',
    title: 'Launch AI Soil Analysis Feature',
    description: 'Deploy AI model for real-time soil analysis',
    fund_percentage: 75,
    status: 'submitted',
    created_at: '2024-03-10',
  },
  {
    id: 'm4',
    startup_id: 'zaraa-001',
    title: 'Farmer-to-Buyer Marketplace Launch',
    description: 'Open marketplace connecting farmers directly to buyers',
    fund_percentage: 100,
    status: 'pending',
    created_at: '2024-03-25',
  },
]

// ============================================================
// 3. MOCK PORTFOLIO
// ============================================================

export const MOCK_PORTFOLIO: Investment[] = [
  {
    id: 'inv-1',
    startup_id: 'zaraa-001',
    startup_name: 'ZaraaFarm',
    sector: 'AgriTech',
    amount_invested: 500000,
    equity_percentage: 0.03,
    status: 'active',
    invested_date: '2024-01-10',
  },
  {
    id: 'inv-2',
    startup_id: 'edu-002',
    startup_name: 'EduPath',
    sector: 'EdTech',
    amount_invested: 200000,
    equity_percentage: 0.0048,
    status: 'active',
    invested_date: '2024-02-15',
  },
]

// ============================================================
// 4. MOCK USER
// ============================================================

export const MOCK_USER: MockUser = {
  id: 'u1',
  full_name: 'Ahmed Khan',
  email: 'ahmed@demo.com',
  role: 'investor',
  kyc_status: 'approved',
  wallet_balance: 4300000,
  avatar: 'AK',
}

// ============================================================
// 5. MOCK TRANSACTIONS
// ============================================================

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'deposit',
    amount: 1000000,
    description: 'Bank transfer - Initial deposit',
    date: '2024-01-05',
  },
  {
    id: 'tx-2',
    type: 'investment',
    amount: 500000,
    description: 'Invested in ZaraaFarm',
    date: '2024-01-10',
    startup_name: 'ZaraaFarm',
  },
  {
    id: 'tx-3',
    type: 'investment',
    amount: 200000,
    description: 'Invested in EduPath',
    date: '2024-02-15',
    startup_name: 'EduPath',
  },
  {
    id: 'tx-4',
    type: 'return',
    amount: 50000,
    description: 'Dividend from ZaraaFarm - Q1 Returns',
    date: '2024-03-31',
    startup_name: 'ZaraaFarm',
  },
  {
    id: 'tx-5',
    type: 'deposit',
    amount: 500000,
    description: 'Bank transfer - Additional funds',
    date: '2024-04-01',
  },
]

// ============================================================
// 6. MOCK KYC USERS
// ============================================================

export const MOCK_KYC_USERS: KYCUser[] = [
  {
    id: 'kyc-1',
    name: 'Ahmed Khan',
    email: 'ahmed@demo.com',
    cnic: '12345-6789012-3',
    status: 'approved',
    submitted_date: '2024-01-01',
    verified_date: '2024-01-05',
  },
  {
    id: 'kyc-2',
    name: 'Fatima Ali',
    email: 'fatima@demo.com',
    cnic: '12345-6789012-4',
    status: 'pending',
    submitted_date: '2024-04-10',
  },
  {
    id: 'kyc-3',
    name: 'Hassan Malik',
    email: 'hassan@demo.com',
    cnic: '12345-6789012-5',
    status: 'pending',
    submitted_date: '2024-04-12',
  },
]

// ============================================================
// 7. MOCK ADMIN STATS
// ============================================================

export const MOCK_ADMIN_STATS: AdminStats = {
  total_users: 3240,
  pending_kyc: 12,
  pending_startups: 8,
  active_startups: 42,
  total_escrow: 4500000000,
  total_transactions: 1247,
}
