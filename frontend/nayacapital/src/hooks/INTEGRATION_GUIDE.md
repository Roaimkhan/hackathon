// ============================================================
// CUSTOM HOOKS INTEGRATION GUIDE
// ============================================================
// All hooks connect to Supabase + FastAPI backend with error handling

import {
  useStartups,          // Fetch all startups with filters
  useStartup,          // Fetch single startup by ID
  useInvest,           // Submit investment
  usePortfolio,        // Fetch user's portfolio
  useMilestones,       // Fetch milestones for a startup
  useSubmitProof,      // Submit milestone proof (founder)
  useApproveMilestone, // Approve milestone (admin)
  useRejectMilestone,  // Reject milestone (admin)
  useWalletDeposit,    // Deposit funds to wallet
  useWalletTransactions, // Fetch wallet transactions
  useWalletBalance,    // Get current wallet balance
  useRealtimeStartup,  // Real-time startup updates
  useRealtimeFundingUpdates, // Real-time funding changes
} from '@/hooks'

// ============================================================
// 1. USESTARUPS - FETCH STARTUPS WITH FILTERS
// ============================================================

export function StartupBrowsePage() {
  const { startups, loading, error, refetch } = useStartups({
    sector: 'agritech',
    sort: 'trending',
    search: 'farm',
  })

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} onRetry={refetch} />

  return (
    <div>
      {startups.map((startup) => (
        <StartupCard key={startup.id} startup={startup} />
      ))}
    </div>
  )
}

// ============================================================
// 2. USESTARTUP - SINGLE STARTUP DETAIL PAGE
// ============================================================

export function StartupDetailPage() {
  const { id } = useParams()
  const { startup, loading, error } = useStartup(id || '')

  if (!startup) return <div>Not found</div>

  return (
    <div>
      <h1>{startup.name}</h1>
      <p>{startup.tagline}</p>
      <FundingBar raised={startup.amount_raised} goal={startup.funding_goal} />
    </div>
  )
}

// ============================================================
// 3. USEINVEST - SUBMIT INVESTMENT
// ============================================================

export function InvestmentModal() {
  const { invest, loading, error } = useInvest()
  const [amount, setAmount] = useState(0)

  const handleInvest = async () => {
    const result = await invest(startupId, amount)
    if (result) {
      // Success! Toast shown automatically
      // Wallet balance updated in AuthContext
    }
  }

  return (
    <modal>
      <input value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      <button onClick={handleInvest} disabled={loading}>
        {loading ? 'Processing...' : 'Invest Now'}
      </button>
    </modal>
  )
}

// ============================================================
// 4. USEPORTFOLIO - FETCH USER INVESTMENTS
// ============================================================

export function InvestorDashboard() {
  const { investments, totalInvested, totalEquity, loading, refetch } = usePortfolio()

  return (
    <div>
      <MetricCard label="Total Invested" value={`Rs ${totalInvested.toLocaleString()}`} />
      <MetricCard label="Total Equity" value={`${totalEquity.toFixed(2)}%`} />

      <table>
        <tbody>
          {investments.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.startup_name}</td>
              <td>Rs {inv.amount_invested.toLocaleString()}</td>
              <td>{inv.equity_percentage.toFixed(3)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={refetch}>Refresh Portfolio</button>
    </div>
  )
}

// ============================================================
// 5. USEMILESTONES - FETCH MILESTONES
// ============================================================

export function MilestonesList() {
  const { milestones, loading, error, refetch } = useMilestones(startupId)

  return (
    <div>
      {milestones.map((m) => (
        <MilestoneCard key={m.id} milestone={m} status={m.status} />
      ))}
    </div>
  )
}

// ============================================================
// 6. USESUBMITPROOF - FOUNDER SUBMITS PROOF
// ============================================================

export function MilestoneProofSubmission() {
  const { submitProof, loading, error } = useSubmitProof()
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async () => {
    if (!file) return
    const success = await submitProof(milestoneId, file)
    if (success) {
      setFile(null)
      // Toast: "Proof submitted! Awaiting admin review..."
    }
  }

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        accept="application/pdf,image/*"
      />
      <button onClick={handleSubmit} disabled={loading || !file}>
        Submit Proof
      </button>
    </div>
  )
}

// ============================================================
// 7. USEAPPROVEEMILESTONE - ADMIN APPROVES MILESTONE
// ============================================================

export function AdminMilestoneReview() {
  const { approveMilestone, loading } = useApproveMilestone()

  const handleApprove = async () => {
    const success = await approveMilestone(milestoneId)
    if (success) {
      // Toast: "✓ Milestone approved! Rs XXX released to founder"
      // Refetch milestone list
    }
  }

  return (
    <card>
      <h3>Verify Milestone Proof</h3>
      <a href={proofLink}>View Proof Document</a>
      <button onClick={handleApprove} disabled={loading}>
        Approve & Release Funds
      </button>
    </card>
  )
}

// ============================================================
// 8. USEREJECTMILESTONE - ADMIN REJECTS WITH REASON
// ============================================================

export function MilestoneRejection() {
  const { rejectMilestone, loading } = useRejectMilestone()
  const [reason, setReason] = useState('')

  const handleReject = async () => {
    const success = await rejectMilestone(milestoneId, reason)
    if (success) {
      // Toast: "Milestone rejected"
      setReason('')
    }
  }

  return (
    <div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for rejection..."
      />
      <button onClick={handleReject} disabled={loading}>
        Reject Milestone
      </button>
    </div>
  )
}

// ============================================================
// 9. USEWALLETDEPOSIT - ADD FUNDS TO WALLET
// ============================================================

export function AddFundsModal() {
  const { deposit, loading, error } = useWalletDeposit()
  const [amount, setAmount] = useState(0)

  const handleDeposit = async () => {
    const success = await deposit(amount)
    if (success) {
      // Toast: "✓ Rs XXXX added to your wallet"
      setAmount(0)
      // Wallet balance updated in localStorage
    }
  }

  return (
    <modal>
      <h2>Add Funds</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Enter amount in Rs"
        min="1"
      />
      <div className="flex gap-2">
        {[500000, 1000000, 5000000].map((preset) => (
          <button key={preset} onClick={() => setAmount(preset)}>
            Rs {(preset / 1000000).toFixed(1)}M
          </button>
        ))}
      </div>
      <button onClick={handleDeposit} disabled={loading || amount < 1}>
        {loading ? 'Processing...' : 'Add to Wallet'}
      </button>
    </modal>
  )
}

// ============================================================
// 10. USEWALLETTRANSACTIONS - FETCH WALLET HISTORY
// ============================================================

export function WalletTransactionHistory() {
  const { transactions, loading, refetch } = useWalletTransactions()

  return (
    <div>
      <h3>Transaction History</h3>
      <table>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.type}</td>
              <td>{tx.description}</td>
              <td>Rs {tx.amount.toLocaleString()}</td>
              <td>{new Date(tx.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}

// ============================================================
// 11. USEWALLET BALANCE - GET CURRENT BALANCE
// ============================================================

export function WalletWidget() {
  const { balance, loading, refetch } = useWalletBalance()

  useEffect(() => {
    refetch() // Fetch on mount
  }, [refetch])

  return (
    <card>
      <p>Wallet Balance</p>
      <h2>Rs {balance.toLocaleString()}</h2>
    </card>
  )
}

// ============================================================
// 12. USEREALTIMESTARTUP - REAL-TIME FUNDING UPDATES
// ============================================================

export function StartupDetailPage() {
  const { startup } = useStartup(id || '')
  const { isConnected } = useRealtimeStartup(id || '')

  return (
    <div>
      {isConnected && <span className="text-green-500">🔴 Live</span>}
      <h1>{startup?.name}</h1>
    </div>
  )
}

// ============================================================
// 13. USEREALTIMEFUNDINDUPDATES - ANIMATE FUNDING BAR ON CHANGES
// ============================================================

export function InvestmentWidget() {
  const [displayedAmount, setDisplayedAmount] = useState(startup?.amount_raised || 0)

  // Subscribe to real-time updates
  useRealtimeFundingUpdates(
    id || '',
    (newAmount, oldAmount) => {
      // Animate FundingBar to new value
      setDisplayedAmount(newAmount)

      // Show toast: "🔥 Someone just invested Rs 500K!"
      const difference = newAmount - oldAmount
      const formattedAmount = (difference / 1000).toFixed(0)
      toast.success(`🔥 Someone just invested Rs ${formattedAmount}K!`)
    },
    (newCount, oldCount) => {
      // Handle investor count change
      console.log(`Investors: ${oldCount} → ${newCount}`)
    }
  )

  return (
    <div>
      <FundingBar raised={displayedAmount} goal={startup?.funding_goal || 0} animated />
    </div>
  )
}

// ============================================================
// ERROR HANDLING PATTERNS
// ============================================================

// 1. All errors are caught and returned in error field
// 2. Automatic toast notifications on errors
// 3. 401 errors → redirect to /login (handled by axios interceptor)
// 4. Network errors → "Connection issue. Please check your internet."
// 5. Validation errors → specific message from API

// ============================================================
// USAGE CHECKLIST FOR YOUR PAGES
// ============================================================

// InvestorDashboard.tsx:
// ✓ usePortfolio() for investments list + stats
// ✓ useWalletBalance() for wallet widget
// ✓ useInvest() if adding invest button
// ✓ useWalletTransactions() if showing history

// FounderDashboard.tsx:
// ✓ useStartup(id) to fetch founder's startup details
// ✓ useMilestones(startupId) to fetch milestones
// ✓ useSubmitProof() for proof submission in milestone cards

// AdminPanel.tsx:
// ✓ useStartups() for startup list
// ✓ useApproveMilestone() for approve buttons
// ✓ useRejectMilestone() for reject with reason
// ✓ Custom API calls for KYC verification (not yet hooked)

// StartupDetailPage.tsx:
// ✓ useStartup(id) for startup data
// ✓ useInvest() for investment modal
// ✓ useRealtimeFundingUpdates() for FundingBar animation
// ✓ useRealtimeStartup() for "live" indicator
