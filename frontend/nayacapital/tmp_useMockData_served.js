const useState = __vite__cjsImport0_react["useState"]; const useEffect = __vite__cjsImport0_react["useEffect"]; const useCallback = __vite__cjsImport0_react["useCallback"];// ============================================================
// MOCK DATA WRAPPER - DEVELOPMENT MODE
// ============================================================
// Set USE_MOCK = false when backend is ready
// When true, all hooks return mock data with 500ms artificial delay
const USE_MOCK = true;
export { USE_MOCK };
// ============================================================
// UTILITY FUNCTION: Simulate API delay
// ============================================================
export const simulateNetworkDelay = (ms = 500) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
// ============================================================
// WRAPPER HOOK FACTORY
// ============================================================
// This intercepts hook calls and returns mock data when USE_MOCK is true
import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=c416c2f5";
import { MOCK_STARTUPS, MOCK_MILESTONES, MOCK_PORTFOLIO, MOCK_USER, MOCK_TRANSACTIONS, MOCK_KYC_USERS, MOCK_ADMIN_STATS } from "/src/data/mockData.ts";
// ============================================================
// 1. MOCK useStartups
// ============================================================
export function useStartupsMock() {
	const [startups, setStartups] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const fetchStartups = useCallback(async () => {
		if (!USE_MOCK) return {
			startups: [],
			loading: false,
			error: null,
			refetch: () => {}
		};
		try {
			setLoading(true);
			setError(null);
			await simulateNetworkDelay();
			setStartups([...MOCK_STARTUPS]);
		} catch (err) {
			setError("Failed to fetch startups");
		} finally {
			setLoading(false);
		}
	}, []);
	useEffect(() => {
		fetchStartups();
	}, [fetchStartups]);
	return {
		startups,
		loading,
		error,
		refetch: fetchStartups
	};
}
// ============================================================
// 2. MOCK useStartup (single)
// ============================================================
export function useStartupMock(id) {
	const [startup, setStartup] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const fetchStartup = useCallback(async () => {
		if (!USE_MOCK || !id) {
			setLoading(false);
			return;
		}
		try {
			setLoading(true);
			setError(null);
			await simulateNetworkDelay();
			const found = MOCK_STARTUPS.find((s) => s.id === id);
			if (!found) {
				throw new Error("Startup not found");
			}
			setStartup({ ...found });
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [id]);
	useEffect(() => {
		fetchStartup();
	}, [fetchStartup]);
	return {
		startup,
		loading,
		error,
		refetch: fetchStartup
	};
}
// ============================================================
// 3. MOCK usePortfolio
// ============================================================
export function usePortfolioMock() {
	const [investments, setInvestments] = useState([]);
	const [totalInvested, setTotalInvested] = useState(0);
	const [totalEquity, setTotalEquity] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const fetchPortfolio = useCallback(async () => {
		if (!USE_MOCK) return;
		try {
			setLoading(true);
			setError(null);
			await simulateNetworkDelay();
			setInvestments([...MOCK_PORTFOLIO]);
			const totalInv = MOCK_PORTFOLIO.reduce((sum, inv) => sum + inv.amount_invested, 0);
			const totalEq = MOCK_PORTFOLIO.reduce((sum, inv) => sum + inv.equity_percentage, 0);
			setTotalInvested(totalInv);
			setTotalEquity(totalEq);
		} catch (err) {
			setError("Failed to fetch portfolio");
		} finally {
			setLoading(false);
		}
	}, []);
	useEffect(() => {
		fetchPortfolio();
	}, [fetchPortfolio]);
	return {
		investments,
		totalInvested,
		totalEquity,
		loading,
		error,
		refetch: fetchPortfolio
	};
}
// ============================================================
// 4. MOCK useMilestones
// ============================================================
export function useMilestonesMock(startupId) {
	const [milestones, setMilestones] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const fetchMilestones = useCallback(async () => {
		if (!USE_MOCK || !startupId) {
			setLoading(false);
			return;
		}
		try {
			setLoading(true);
			setError(null);
			await simulateNetworkDelay();
			const milestones = MOCK_MILESTONES.filter((m) => m.startup_id === startupId);
			setMilestones([...milestones]);
		} catch (err) {
			setError("Failed to fetch milestones");
		} finally {
			setLoading(false);
		}
	}, [startupId]);
	useEffect(() => {
		fetchMilestones();
	}, [fetchMilestones]);
	return {
		milestones,
		loading,
		error,
		refetch: fetchMilestones
	};
}
// ============================================================
// 5. MOCK useInvest
// ============================================================
export function useInvestMock() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const invest = useCallback(async (startupId, amountPkr) => {
		if (!USE_MOCK) return null;
		try {
			setLoading(true);
			setError(null);
			await simulateNetworkDelay(800);
			// Mock: Calculate equity
			const startup = MOCK_STARTUPS.find((s) => s.id === startupId);
			if (!startup) throw new Error("Startup not found");
			const equityPercentage = amountPkr / startup.funding_goal * startup.equity_offered;
			return {
				id: `inv-${Date.now()}`,
				startup_id: startupId,
				amount: amountPkr,
				equity_percentage: equityPercentage,
				status: "pending",
				created_at: new Date().toISOString()
			};
		} catch (err) {
			setError(err.message);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);
	return {
		invest,
		loading,
		error
	};
}
// ============================================================
// 6. MOCK useWalletBalance
// ============================================================
export function useWalletBalanceMock() {
	const [balance, setBalance] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const fetchBalance = useCallback(async () => {
		if (!USE_MOCK) return;
		try {
			setLoading(true);
			setError(null);
			await simulateNetworkDelay();
			setBalance(MOCK_USER.wallet_balance);
		} catch (err) {
			setError("Failed to fetch balance");
		} finally {
			setLoading(false);
		}
	}, []);
	useEffect(() => {
		fetchBalance();
	}, [fetchBalance]);
	return {
		balance,
		loading,
		error,
		refetch: fetchBalance
	};
}
// ============================================================
// 7. MOCK useWalletTransactions
// ============================================================
export function useWalletTransactionsMock() {
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const fetchTransactions = useCallback(async () => {
		if (!USE_MOCK) return;
		try {
			setLoading(true);
			setError(null);
			await simulateNetworkDelay();
			setTransactions([...MOCK_TRANSACTIONS]);
		} catch (err) {
			setError("Failed to fetch transactions");
		} finally {
			setLoading(false);
		}
	}, []);
	useEffect(() => {
		fetchTransactions();
	}, [fetchTransactions]);
	return {
		transactions,
		loading,
		error,
		refetch: fetchTransactions
	};
}
// ============================================================
// 8. MOCK useWalletDeposit
// ============================================================
export function useWalletDepositMock() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const deposit = useCallback(async (amount) => {
		if (!USE_MOCK) return false;
		try {
			setLoading(true);
			setError(null);
			if (amount < 1) {
				throw new Error("Minimum deposit is Rs 1");
			}
			await simulateNetworkDelay(600);
			// Mock: Update localStorage
			const currentBalance = parseFloat(localStorage.getItem("user_wallet_balance") || "0");
			const newBalance = currentBalance + amount;
			localStorage.setItem("user_wallet_balance", newBalance.toString());
			return true;
		} catch (err) {
			setError(err.message);
			return false;
		} finally {
			setLoading(false);
		}
	}, []);
	return {
		deposit,
		loading,
		error
	};
}
// ============================================================
// 9. MOCK useSubmitProof
// ============================================================
export function useSubmitProofMock() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const submitProof = useCallback(async (milestoneId, file) => {
		if (!USE_MOCK) return false;
		try {
			setLoading(true);
			setError(null);
			await simulateNetworkDelay(1e3);
			// Mock: Update milestone status
			const milestone = MOCK_MILESTONES.find((m) => m.id === milestoneId);
			if (milestone) {
				milestone.status = "submitted";
			}
			return true;
		} catch (err) {
			setError(err.message);
			return false;
		} finally {
			setLoading(false);
		}
	}, []);
	return {
		submitProof,
		loading,
		error
	};
}
// ============================================================
// 10. MOCK useApproveMilestone
// ============================================================
export function useApproveMilestoneMock() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const approveMilestone = useCallback(async (milestoneId) => {
		if (!USE_MOCK) return false;
		try {
			setLoading(true);
			setError(null);
			await simulateNetworkDelay(700);
			// Mock: Update milestone status
			const milestone = MOCK_MILESTONES.find((m) => m.id === milestoneId);
			if (milestone) {
				milestone.status = "approved";
			}
			return true;
		} catch (err) {
			setError(err.message);
			return false;
		} finally {
			setLoading(false);
		}
	}, []);
	return {
		approveMilestone,
		loading,
		error
	};
}
// ============================================================
// 11. MOCK useRejectMilestone
// ============================================================
export function useRejectMilestoneMock() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const rejectMilestone = useCallback(async (milestoneId, reason) => {
		if (!USE_MOCK) return false;
		try {
			setLoading(true);
			setError(null);
			await simulateNetworkDelay(500);
			// Mock: Update milestone status
			const milestone = MOCK_MILESTONES.find((m) => m.id === milestoneId);
			if (milestone) {
				milestone.status = "rejected";
				milestone.rejection_reason = reason;
			}
			return true;
		} catch (err) {
			setError(err.message);
			return false;
		} finally {
			setLoading(false);
		}
	}, []);
	return {
		rejectMilestone,
		loading,
		error
	};
}
// ============================================================
// 12. MOCK ADMIN FUNCTIONS
// ============================================================
export function useAdminStatsMock() {
	const [stats, setStats] = useState(MOCK_ADMIN_STATS);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const fetch = async () => {
			if (!USE_MOCK) return;
			await simulateNetworkDelay();
			setStats(MOCK_ADMIN_STATS);
			setLoading(false);
		};
		fetch();
	}, []);
	return {
		stats,
		loading
	};
}
export function useAdminKYCListMock() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const fetch = async () => {
			if (!USE_MOCK) return;
			await simulateNetworkDelay();
			setUsers([...MOCK_KYC_USERS]);
			setLoading(false);
		};
		fetch();
	}, []);
	return {
		users,
		loading
	};
}
// ============================================================
// SWITCHING BETWEEN MOCK AND REAL
// ============================================================
// To use mock data in your hooks:
//
// 1. In useStartups.ts, add at the top:
//    import { USE_MOCK, useStartupsMock } from '../data/useMockData'
//
// 2. Modify the hook to check USE_MOCK first:
//    export const useStartups = (filters?: StartupFilters) => {
//      if (USE_MOCK) {
//        return useStartupsMock()
//      }
//      // ... real API code
//    }
//
// 3. When backend is ready, just set USE_MOCK = false in useMockData.ts
//
// Frontend will automatically switch to real API calls!
export const MOCK_SETUP_INSTRUCTIONS = `
=== MOCK DATA SETUP FOR HOOKS ===

To enable mock data, update each hook like this:

// In src/hooks/useStartups.ts
import { USE_MOCK, useStartupsMock } from '../data/useMockData'

export const useStartups = (filters?: StartupFilters) => {
  if (USE_MOCK) return useStartupsMock()
  // ... real API code
}

// In src/hooks/usePortfolio.ts
import { USE_MOCK, usePortfolioMock } from '../data/useMockData'

export const usePortfolio = () => {
  if (USE_MOCK) return usePortfolioMock()
  // ... real API code
}

// Do this for all hooks!

// When backend is ready, just change in useMockData.ts:
const USE_MOCK = false

// Frontend will automatically use real API calls!
`;

//# sourceMappingURL=data:application/json;base64,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c2VNb2NrRGF0YS50cyJdLCJ2ZXJzaW9uIjozLCJzb3VyY2VzQ29udGVudCI6WyIvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gTU9DSyBEQVRBIFdSQVBQRVIgLSBERVZFTE9QTUVOVCBNT0RFXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBTZXQgVVNFX01PQ0sgPSBmYWxzZSB3aGVuIGJhY2tlbmQgaXMgcmVhZHlcclxuLy8gV2hlbiB0cnVlLCBhbGwgaG9va3MgcmV0dXJuIG1vY2sgZGF0YSB3aXRoIDUwMG1zIGFydGlmaWNpYWwgZGVsYXlcclxuXHJcbmNvbnN0IFVTRV9NT0NLID0gdHJ1ZSAvLyBTd2l0Y2ggdG8gZmFsc2Ugd2hlbiBiYWNrZW5kIGlzIHJlYWR5XHJcblxyXG5leHBvcnQgeyBVU0VfTU9DSyB9XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gVVRJTElUWSBGVU5DVElPTjogU2ltdWxhdGUgQVBJIGRlbGF5XHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGNvbnN0IHNpbXVsYXRlTmV0d29ya0RlbGF5ID0gKG1zOiBudW1iZXIgPSA1MDApID0+IHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gV1JBUFBFUiBIT09LIEZBQ1RPUllcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFRoaXMgaW50ZXJjZXB0cyBob29rIGNhbGxzIGFuZCByZXR1cm5zIG1vY2sgZGF0YSB3aGVuIFVTRV9NT0NLIGlzIHRydWVcclxuXHJcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnXHJcbmltcG9ydCB7XHJcbiAgTU9DS19TVEFSVFVQUyxcclxuICBNT0NLX01JTEVTVE9ORVMsXHJcbiAgTU9DS19QT1JURk9MSU8sXHJcbiAgTU9DS19VU0VSLFxyXG4gIE1PQ0tfVFJBTlNBQ1RJT05TLFxyXG4gIE1PQ0tfS1lDX1VTRVJTLFxyXG4gIE1PQ0tfQURNSU5fU1RBVFMsXHJcbn0gZnJvbSAnLi9tb2NrRGF0YSdcclxuaW1wb3J0IHR5cGUgeyBTdGFydHVwLCBNaWxlc3RvbmUsIEludmVzdG1lbnQsIFRyYW5zYWN0aW9uLCBLWUNVc2VyIH0gZnJvbSAnLi9tb2NrRGF0YSdcclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyAxLiBNT0NLIHVzZVN0YXJ0dXBzXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVzZVN0YXJ0dXBzTW9jaygpIHtcclxuICBjb25zdCBbc3RhcnR1cHMsIHNldFN0YXJ0dXBzXSA9IHVzZVN0YXRlPFN0YXJ0dXBbXT4oW10pXHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSlcclxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXHJcblxyXG4gIGNvbnN0IGZldGNoU3RhcnR1cHMgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAoIVVTRV9NT0NLKSByZXR1cm4geyBzdGFydHVwczogW10sIGxvYWRpbmc6IGZhbHNlLCBlcnJvcjogbnVsbCwgcmVmZXRjaDogKCkgPT4ge30gfVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIHNldExvYWRpbmcodHJ1ZSlcclxuICAgICAgc2V0RXJyb3IobnVsbClcclxuICAgICAgYXdhaXQgc2ltdWxhdGVOZXR3b3JrRGVsYXkoKVxyXG4gICAgICBzZXRTdGFydHVwcyhbLi4uTU9DS19TVEFSVFVQU10pXHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgc2V0RXJyb3IoJ0ZhaWxlZCB0byBmZXRjaCBzdGFydHVwcycpXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxyXG4gICAgfVxyXG4gIH0sIFtdKVxyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgZmV0Y2hTdGFydHVwcygpXHJcbiAgfSwgW2ZldGNoU3RhcnR1cHNdKVxyXG5cclxuICByZXR1cm4geyBzdGFydHVwcywgbG9hZGluZywgZXJyb3IsIHJlZmV0Y2g6IGZldGNoU3RhcnR1cHMgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gMi4gTU9DSyB1c2VTdGFydHVwIChzaW5nbGUpXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVzZVN0YXJ0dXBNb2NrKGlkOiBzdHJpbmcpIHtcclxuICBjb25zdCBbc3RhcnR1cCwgc2V0U3RhcnR1cF0gPSB1c2VTdGF0ZTxTdGFydHVwIHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKVxyXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcclxuXHJcbiAgY29uc3QgZmV0Y2hTdGFydHVwID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCFVU0VfTU9DSyB8fCAhaWQpIHtcclxuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgc2V0TG9hZGluZyh0cnVlKVxyXG4gICAgICBzZXRFcnJvcihudWxsKVxyXG4gICAgICBhd2FpdCBzaW11bGF0ZU5ldHdvcmtEZWxheSgpXHJcbiAgICAgIGNvbnN0IGZvdW5kID0gTU9DS19TVEFSVFVQUy5maW5kKChzKSA9PiBzLmlkID09PSBpZClcclxuICAgICAgaWYgKCFmb3VuZCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU3RhcnR1cCBub3QgZm91bmQnKVxyXG4gICAgICB9XHJcbiAgICAgIHNldFN0YXJ0dXAoeyAuLi5mb3VuZCB9KVxyXG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcclxuICAgICAgc2V0RXJyb3IoZXJyLm1lc3NhZ2UpXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxyXG4gICAgfVxyXG4gIH0sIFtpZF0pXHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBmZXRjaFN0YXJ0dXAoKVxyXG4gIH0sIFtmZXRjaFN0YXJ0dXBdKVxyXG5cclxuICByZXR1cm4geyBzdGFydHVwLCBsb2FkaW5nLCBlcnJvciwgcmVmZXRjaDogZmV0Y2hTdGFydHVwIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIDMuIE1PQ0sgdXNlUG9ydGZvbGlvXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVzZVBvcnRmb2xpb01vY2soKSB7XHJcbiAgY29uc3QgW2ludmVzdG1lbnRzLCBzZXRJbnZlc3RtZW50c10gPSB1c2VTdGF0ZTxJbnZlc3RtZW50W10+KFtdKVxyXG4gIGNvbnN0IFt0b3RhbEludmVzdGVkLCBzZXRUb3RhbEludmVzdGVkXSA9IHVzZVN0YXRlKDApXHJcbiAgY29uc3QgW3RvdGFsRXF1aXR5LCBzZXRUb3RhbEVxdWl0eV0gPSB1c2VTdGF0ZSgwKVxyXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpXHJcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxyXG5cclxuICBjb25zdCBmZXRjaFBvcnRmb2xpbyA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcclxuICAgIGlmICghVVNFX01PQ0spIHJldHVyblxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIHNldExvYWRpbmcodHJ1ZSlcclxuICAgICAgc2V0RXJyb3IobnVsbClcclxuICAgICAgYXdhaXQgc2ltdWxhdGVOZXR3b3JrRGVsYXkoKVxyXG5cclxuICAgICAgc2V0SW52ZXN0bWVudHMoWy4uLk1PQ0tfUE9SVEZPTElPXSlcclxuICAgICAgY29uc3QgdG90YWxJbnYgPSBNT0NLX1BPUlRGT0xJTy5yZWR1Y2UoKHN1bSwgaW52KSA9PiBzdW0gKyBpbnYuYW1vdW50X2ludmVzdGVkLCAwKVxyXG4gICAgICBjb25zdCB0b3RhbEVxID0gTU9DS19QT1JURk9MSU8ucmVkdWNlKChzdW0sIGludikgPT4gc3VtICsgaW52LmVxdWl0eV9wZXJjZW50YWdlLCAwKVxyXG5cclxuICAgICAgc2V0VG90YWxJbnZlc3RlZCh0b3RhbEludilcclxuICAgICAgc2V0VG90YWxFcXVpdHkodG90YWxFcSlcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBzZXRFcnJvcignRmFpbGVkIHRvIGZldGNoIHBvcnRmb2xpbycpXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxyXG4gICAgfVxyXG4gIH0sIFtdKVxyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgZmV0Y2hQb3J0Zm9saW8oKVxyXG4gIH0sIFtmZXRjaFBvcnRmb2xpb10pXHJcblxyXG4gIHJldHVybiB7IGludmVzdG1lbnRzLCB0b3RhbEludmVzdGVkLCB0b3RhbEVxdWl0eSwgbG9hZGluZywgZXJyb3IsIHJlZmV0Y2g6IGZldGNoUG9ydGZvbGlvIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIDQuIE1PQ0sgdXNlTWlsZXN0b25lc1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1c2VNaWxlc3RvbmVzTW9jayhzdGFydHVwSWQ6IHN0cmluZykge1xyXG4gIGNvbnN0IFttaWxlc3RvbmVzLCBzZXRNaWxlc3RvbmVzXSA9IHVzZVN0YXRlPE1pbGVzdG9uZVtdPihbXSlcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKVxyXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcclxuXHJcbiAgY29uc3QgZmV0Y2hNaWxlc3RvbmVzID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCFVU0VfTU9DSyB8fCAhc3RhcnR1cElkKSB7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIHNldExvYWRpbmcodHJ1ZSlcclxuICAgICAgc2V0RXJyb3IobnVsbClcclxuICAgICAgYXdhaXQgc2ltdWxhdGVOZXR3b3JrRGVsYXkoKVxyXG5cclxuICAgICAgY29uc3QgbWlsZXN0b25lcyA9IE1PQ0tfTUlMRVNUT05FUy5maWx0ZXIoKG0pID0+IG0uc3RhcnR1cF9pZCA9PT0gc3RhcnR1cElkKVxyXG4gICAgICBzZXRNaWxlc3RvbmVzKFsuLi5taWxlc3RvbmVzXSlcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBzZXRFcnJvcignRmFpbGVkIHRvIGZldGNoIG1pbGVzdG9uZXMnKVxyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcclxuICAgIH1cclxuICB9LCBbc3RhcnR1cElkXSlcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGZldGNoTWlsZXN0b25lcygpXHJcbiAgfSwgW2ZldGNoTWlsZXN0b25lc10pXHJcblxyXG4gIHJldHVybiB7IG1pbGVzdG9uZXMsIGxvYWRpbmcsIGVycm9yLCByZWZldGNoOiBmZXRjaE1pbGVzdG9uZXMgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gNS4gTU9DSyB1c2VJbnZlc3RcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXNlSW52ZXN0TW9jaygpIHtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXHJcblxyXG4gIGNvbnN0IGludmVzdCA9IHVzZUNhbGxiYWNrKGFzeW5jIChzdGFydHVwSWQ6IHN0cmluZywgYW1vdW50UGtyOiBudW1iZXIpID0+IHtcclxuICAgIGlmICghVVNFX01PQ0spIHJldHVybiBudWxsXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgc2V0TG9hZGluZyh0cnVlKVxyXG4gICAgICBzZXRFcnJvcihudWxsKVxyXG4gICAgICBhd2FpdCBzaW11bGF0ZU5ldHdvcmtEZWxheSg4MDApIC8vIFNsaWdodGx5IGxvbmdlciBmb3IgcGF5bWVudCBwcm9jZXNzaW5nXHJcblxyXG4gICAgICAvLyBNb2NrOiBDYWxjdWxhdGUgZXF1aXR5XHJcbiAgICAgIGNvbnN0IHN0YXJ0dXAgPSBNT0NLX1NUQVJUVVBTLmZpbmQoKHMpID0+IHMuaWQgPT09IHN0YXJ0dXBJZClcclxuICAgICAgaWYgKCFzdGFydHVwKSB0aHJvdyBuZXcgRXJyb3IoJ1N0YXJ0dXAgbm90IGZvdW5kJylcclxuXHJcbiAgICAgIGNvbnN0IGVxdWl0eVBlcmNlbnRhZ2UgPSAoYW1vdW50UGtyIC8gc3RhcnR1cC5mdW5kaW5nX2dvYWwpICogc3RhcnR1cC5lcXVpdHlfb2ZmZXJlZFxyXG5cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBpZDogYGludi0ke0RhdGUubm93KCl9YCxcclxuICAgICAgICBzdGFydHVwX2lkOiBzdGFydHVwSWQsXHJcbiAgICAgICAgYW1vdW50OiBhbW91bnRQa3IsXHJcbiAgICAgICAgZXF1aXR5X3BlcmNlbnRhZ2U6IGVxdWl0eVBlcmNlbnRhZ2UsXHJcbiAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXHJcbiAgICAgICAgY3JlYXRlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICBzZXRFcnJvcihlcnIubWVzc2FnZSlcclxuICAgICAgcmV0dXJuIG51bGxcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXHJcbiAgICB9XHJcbiAgfSwgW10pXHJcblxyXG4gIHJldHVybiB7IGludmVzdCwgbG9hZGluZywgZXJyb3IgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gNi4gTU9DSyB1c2VXYWxsZXRCYWxhbmNlXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVzZVdhbGxldEJhbGFuY2VNb2NrKCkge1xyXG4gIGNvbnN0IFtiYWxhbmNlLCBzZXRCYWxhbmNlXSA9IHVzZVN0YXRlKDApXHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSlcclxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXHJcblxyXG4gIGNvbnN0IGZldGNoQmFsYW5jZSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcclxuICAgIGlmICghVVNFX01PQ0spIHJldHVyblxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIHNldExvYWRpbmcodHJ1ZSlcclxuICAgICAgc2V0RXJyb3IobnVsbClcclxuICAgICAgYXdhaXQgc2ltdWxhdGVOZXR3b3JrRGVsYXkoKVxyXG4gICAgICBzZXRCYWxhbmNlKE1PQ0tfVVNFUi53YWxsZXRfYmFsYW5jZSlcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBzZXRFcnJvcignRmFpbGVkIHRvIGZldGNoIGJhbGFuY2UnKVxyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcclxuICAgIH1cclxuICB9LCBbXSlcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGZldGNoQmFsYW5jZSgpXHJcbiAgfSwgW2ZldGNoQmFsYW5jZV0pXHJcblxyXG4gIHJldHVybiB7IGJhbGFuY2UsIGxvYWRpbmcsIGVycm9yLCByZWZldGNoOiBmZXRjaEJhbGFuY2UgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gNy4gTU9DSyB1c2VXYWxsZXRUcmFuc2FjdGlvbnNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXNlV2FsbGV0VHJhbnNhY3Rpb25zTW9jaygpIHtcclxuICBjb25zdCBbdHJhbnNhY3Rpb25zLCBzZXRUcmFuc2FjdGlvbnNdID0gdXNlU3RhdGU8VHJhbnNhY3Rpb25bXT4oW10pXHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSlcclxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXHJcblxyXG4gIGNvbnN0IGZldGNoVHJhbnNhY3Rpb25zID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCFVU0VfTU9DSykgcmV0dXJuXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgc2V0TG9hZGluZyh0cnVlKVxyXG4gICAgICBzZXRFcnJvcihudWxsKVxyXG4gICAgICBhd2FpdCBzaW11bGF0ZU5ldHdvcmtEZWxheSgpXHJcbiAgICAgIHNldFRyYW5zYWN0aW9ucyhbLi4uTU9DS19UUkFOU0FDVElPTlNdKVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIHNldEVycm9yKCdGYWlsZWQgdG8gZmV0Y2ggdHJhbnNhY3Rpb25zJylcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXHJcbiAgICB9XHJcbiAgfSwgW10pXHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBmZXRjaFRyYW5zYWN0aW9ucygpXHJcbiAgfSwgW2ZldGNoVHJhbnNhY3Rpb25zXSlcclxuXHJcbiAgcmV0dXJuIHsgdHJhbnNhY3Rpb25zLCBsb2FkaW5nLCBlcnJvciwgcmVmZXRjaDogZmV0Y2hUcmFuc2FjdGlvbnMgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gOC4gTU9DSyB1c2VXYWxsZXREZXBvc2l0XHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVzZVdhbGxldERlcG9zaXRNb2NrKCkge1xyXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcclxuXHJcbiAgY29uc3QgZGVwb3NpdCA9IHVzZUNhbGxiYWNrKGFzeW5jIChhbW91bnQ6IG51bWJlcikgPT4ge1xyXG4gICAgaWYgKCFVU0VfTU9DSykgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgc2V0TG9hZGluZyh0cnVlKVxyXG4gICAgICBzZXRFcnJvcihudWxsKVxyXG5cclxuICAgICAgaWYgKGFtb3VudCA8IDEpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pbmltdW0gZGVwb3NpdCBpcyBScyAxJylcclxuICAgICAgfVxyXG5cclxuICAgICAgYXdhaXQgc2ltdWxhdGVOZXR3b3JrRGVsYXkoNjAwKSAvLyBQYXltZW50IHByb2Nlc3NpbmcgZGVsYXlcclxuXHJcbiAgICAgIC8vIE1vY2s6IFVwZGF0ZSBsb2NhbFN0b3JhZ2VcclxuICAgICAgY29uc3QgY3VycmVudEJhbGFuY2UgPSBwYXJzZUZsb2F0KGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyX3dhbGxldF9iYWxhbmNlJykgfHwgJzAnKVxyXG4gICAgICBjb25zdCBuZXdCYWxhbmNlID0gY3VycmVudEJhbGFuY2UgKyBhbW91bnRcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXJfd2FsbGV0X2JhbGFuY2UnLCBuZXdCYWxhbmNlLnRvU3RyaW5nKCkpXHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcclxuICAgICAgc2V0RXJyb3IoZXJyLm1lc3NhZ2UpXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcclxuICAgIH1cclxuICB9LCBbXSlcclxuXHJcbiAgcmV0dXJuIHsgZGVwb3NpdCwgbG9hZGluZywgZXJyb3IgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuLy8gOS4gTU9DSyB1c2VTdWJtaXRQcm9vZlxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1c2VTdWJtaXRQcm9vZk1vY2soKSB7XHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxyXG5cclxuICBjb25zdCBzdWJtaXRQcm9vZiA9IHVzZUNhbGxiYWNrKGFzeW5jIChtaWxlc3RvbmVJZDogc3RyaW5nLCBmaWxlOiBGaWxlKSA9PiB7XHJcbiAgICBpZiAoIVVTRV9NT0NLKSByZXR1cm4gZmFsc2VcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBzZXRMb2FkaW5nKHRydWUpXHJcbiAgICAgIHNldEVycm9yKG51bGwpXHJcbiAgICAgIGF3YWl0IHNpbXVsYXRlTmV0d29ya0RlbGF5KDEwMDApIC8vIEZpbGUgdXBsb2FkIGRlbGF5XHJcblxyXG4gICAgICAvLyBNb2NrOiBVcGRhdGUgbWlsZXN0b25lIHN0YXR1c1xyXG4gICAgICBjb25zdCBtaWxlc3RvbmUgPSBNT0NLX01JTEVTVE9ORVMuZmluZCgobSkgPT4gbS5pZCA9PT0gbWlsZXN0b25lSWQpXHJcbiAgICAgIGlmIChtaWxlc3RvbmUpIHtcclxuICAgICAgICBtaWxlc3RvbmUuc3RhdHVzID0gJ3N1Ym1pdHRlZCdcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgIHNldEVycm9yKGVyci5tZXNzYWdlKVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXHJcbiAgICB9XHJcbiAgfSwgW10pXHJcblxyXG4gIHJldHVybiB7IHN1Ym1pdFByb29mLCBsb2FkaW5nLCBlcnJvciB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyAxMC4gTU9DSyB1c2VBcHByb3ZlTWlsZXN0b25lXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVzZUFwcHJvdmVNaWxlc3RvbmVNb2NrKCkge1xyXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcclxuXHJcbiAgY29uc3QgYXBwcm92ZU1pbGVzdG9uZSA9IHVzZUNhbGxiYWNrKGFzeW5jIChtaWxlc3RvbmVJZDogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoIVVTRV9NT0NLKSByZXR1cm4gZmFsc2VcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBzZXRMb2FkaW5nKHRydWUpXHJcbiAgICAgIHNldEVycm9yKG51bGwpXHJcbiAgICAgIGF3YWl0IHNpbXVsYXRlTmV0d29ya0RlbGF5KDcwMClcclxuXHJcbiAgICAgIC8vIE1vY2s6IFVwZGF0ZSBtaWxlc3RvbmUgc3RhdHVzXHJcbiAgICAgIGNvbnN0IG1pbGVzdG9uZSA9IE1PQ0tfTUlMRVNUT05FUy5maW5kKChtKSA9PiBtLmlkID09PSBtaWxlc3RvbmVJZClcclxuICAgICAgaWYgKG1pbGVzdG9uZSkge1xyXG4gICAgICAgIG1pbGVzdG9uZS5zdGF0dXMgPSAnYXBwcm92ZWQnXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICBzZXRFcnJvcihlcnIubWVzc2FnZSlcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxyXG4gICAgfVxyXG4gIH0sIFtdKVxyXG5cclxuICByZXR1cm4geyBhcHByb3ZlTWlsZXN0b25lLCBsb2FkaW5nLCBlcnJvciB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4vLyAxMS4gTU9DSyB1c2VSZWplY3RNaWxlc3RvbmVcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXNlUmVqZWN0TWlsZXN0b25lTW9jaygpIHtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXHJcblxyXG4gIGNvbnN0IHJlamVjdE1pbGVzdG9uZSA9IHVzZUNhbGxiYWNrKGFzeW5jIChtaWxlc3RvbmVJZDogc3RyaW5nLCByZWFzb246IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKCFVU0VfTU9DSykgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgc2V0TG9hZGluZyh0cnVlKVxyXG4gICAgICBzZXRFcnJvcihudWxsKVxyXG4gICAgICBhd2FpdCBzaW11bGF0ZU5ldHdvcmtEZWxheSg1MDApXHJcblxyXG4gICAgICAvLyBNb2NrOiBVcGRhdGUgbWlsZXN0b25lIHN0YXR1c1xyXG4gICAgICBjb25zdCBtaWxlc3RvbmUgPSBNT0NLX01JTEVTVE9ORVMuZmluZCgobSkgPT4gbS5pZCA9PT0gbWlsZXN0b25lSWQpXHJcbiAgICAgIGlmIChtaWxlc3RvbmUpIHtcclxuICAgICAgICBtaWxlc3RvbmUuc3RhdHVzID0gJ3JlamVjdGVkJ1xyXG4gICAgICAgIG1pbGVzdG9uZS5yZWplY3Rpb25fcmVhc29uID0gcmVhc29uXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICBzZXRFcnJvcihlcnIubWVzc2FnZSlcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxyXG4gICAgfVxyXG4gIH0sIFtdKVxyXG5cclxuICByZXR1cm4geyByZWplY3RNaWxlc3RvbmUsIGxvYWRpbmcsIGVycm9yIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIDEyLiBNT0NLIEFETUlOIEZVTkNUSU9OU1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1c2VBZG1pblN0YXRzTW9jaygpIHtcclxuICBjb25zdCBbc3RhdHMsIHNldFN0YXRzXSA9IHVzZVN0YXRlKE1PQ0tfQURNSU5fU1RBVFMpXHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSlcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGNvbnN0IGZldGNoID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICBpZiAoIVVTRV9NT0NLKSByZXR1cm5cclxuICAgICAgYXdhaXQgc2ltdWxhdGVOZXR3b3JrRGVsYXkoKVxyXG4gICAgICBzZXRTdGF0cyhNT0NLX0FETUlOX1NUQVRTKVxyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxyXG4gICAgfVxyXG4gICAgZmV0Y2goKVxyXG4gIH0sIFtdKVxyXG5cclxuICByZXR1cm4geyBzdGF0cywgbG9hZGluZyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1c2VBZG1pbktZQ0xpc3RNb2NrKCkge1xyXG4gIGNvbnN0IFt1c2Vycywgc2V0VXNlcnNdID0gdXNlU3RhdGU8S1lDVXNlcltdPihbXSlcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKVxyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgY29uc3QgZmV0Y2ggPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGlmICghVVNFX01PQ0spIHJldHVyblxyXG4gICAgICBhd2FpdCBzaW11bGF0ZU5ldHdvcmtEZWxheSgpXHJcbiAgICAgIHNldFVzZXJzKFsuLi5NT0NLX0tZQ19VU0VSU10pXHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXHJcbiAgICB9XHJcbiAgICBmZXRjaCgpXHJcbiAgfSwgW10pXHJcblxyXG4gIHJldHVybiB7IHVzZXJzLCBsb2FkaW5nIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFNXSVRDSElORyBCRVRXRUVOIE1PQ0sgQU5EIFJFQUxcclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFRvIHVzZSBtb2NrIGRhdGEgaW4geW91ciBob29rczpcclxuLy9cclxuLy8gMS4gSW4gdXNlU3RhcnR1cHMudHMsIGFkZCBhdCB0aGUgdG9wOlxyXG4vLyAgICBpbXBvcnQgeyBVU0VfTU9DSywgdXNlU3RhcnR1cHNNb2NrIH0gZnJvbSAnLi4vZGF0YS91c2VNb2NrRGF0YSdcclxuLy9cclxuLy8gMi4gTW9kaWZ5IHRoZSBob29rIHRvIGNoZWNrIFVTRV9NT0NLIGZpcnN0OlxyXG4vLyAgICBleHBvcnQgY29uc3QgdXNlU3RhcnR1cHMgPSAoZmlsdGVycz86IFN0YXJ0dXBGaWx0ZXJzKSA9PiB7XHJcbi8vICAgICAgaWYgKFVTRV9NT0NLKSB7XHJcbi8vICAgICAgICByZXR1cm4gdXNlU3RhcnR1cHNNb2NrKClcclxuLy8gICAgICB9XHJcbi8vICAgICAgLy8gLi4uIHJlYWwgQVBJIGNvZGVcclxuLy8gICAgfVxyXG4vL1xyXG4vLyAzLiBXaGVuIGJhY2tlbmQgaXMgcmVhZHksIGp1c3Qgc2V0IFVTRV9NT0NLID0gZmFsc2UgaW4gdXNlTW9ja0RhdGEudHNcclxuLy9cclxuLy8gRnJvbnRlbmQgd2lsbCBhdXRvbWF0aWNhbGx5IHN3aXRjaCB0byByZWFsIEFQSSBjYWxscyFcclxuXHJcbmV4cG9ydCBjb25zdCBNT0NLX1NFVFVQX0lOU1RSVUNUSU9OUyA9IGBcclxuPT09IE1PQ0sgREFUQSBTRVRVUCBGT1IgSE9PS1MgPT09XHJcblxyXG5UbyBlbmFibGUgbW9jayBkYXRhLCB1cGRhdGUgZWFjaCBob29rIGxpa2UgdGhpczpcclxuXHJcbi8vIEluIHNyYy9ob29rcy91c2VTdGFydHVwcy50c1xyXG5pbXBvcnQgeyBVU0VfTU9DSywgdXNlU3RhcnR1cHNNb2NrIH0gZnJvbSAnLi4vZGF0YS91c2VNb2NrRGF0YSdcclxuXHJcbmV4cG9ydCBjb25zdCB1c2VTdGFydHVwcyA9IChmaWx0ZXJzPzogU3RhcnR1cEZpbHRlcnMpID0+IHtcclxuICBpZiAoVVNFX01PQ0spIHJldHVybiB1c2VTdGFydHVwc01vY2soKVxyXG4gIC8vIC4uLiByZWFsIEFQSSBjb2RlXHJcbn1cclxuXHJcbi8vIEluIHNyYy9ob29rcy91c2VQb3J0Zm9saW8udHNcclxuaW1wb3J0IHsgVVNFX01PQ0ssIHVzZVBvcnRmb2xpb01vY2sgfSBmcm9tICcuLi9kYXRhL3VzZU1vY2tEYXRhJ1xyXG5cclxuZXhwb3J0IGNvbnN0IHVzZVBvcnRmb2xpbyA9ICgpID0+IHtcclxuICBpZiAoVVNFX01PQ0spIHJldHVybiB1c2VQb3J0Zm9saW9Nb2NrKClcclxuICAvLyAuLi4gcmVhbCBBUEkgY29kZVxyXG59XHJcblxyXG4vLyBEbyB0aGlzIGZvciBhbGwgaG9va3MhXHJcblxyXG4vLyBXaGVuIGJhY2tlbmQgaXMgcmVhZHksIGp1c3QgY2hhbmdlIGluIHVzZU1vY2tEYXRhLnRzOlxyXG5jb25zdCBVU0VfTU9DSyA9IGZhbHNlXHJcblxyXG4vLyBGcm9udGVuZCB3aWxsIGF1dG9tYXRpY2FsbHkgdXNlIHJlYWwgQVBJIGNhbGxzIVxyXG5gXHJcbiJdfQ==
