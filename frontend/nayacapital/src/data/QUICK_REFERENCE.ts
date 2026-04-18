// Quick reference notes for mock data usage.
// This file intentionally exports plain data only (no executable JSX snippets).

export const QUICK_REFERENCE = {
  purpose: 'Mock data quick reference for frontend development',
  modules: [
    'mockData.ts',
    'useMockData.ts',
    'hooks/*',
  ],
  notes: [
    'Set USE_MOCK=true in useMockData.ts to bypass backend calls.',
    'Set USE_MOCK=false to switch hooks to real API behavior.',
    'Mock hooks include artificial delays to test loading states.',
  ],
} as const
