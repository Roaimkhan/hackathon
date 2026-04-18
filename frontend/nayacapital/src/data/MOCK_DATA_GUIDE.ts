// Mock data setup guide stored as static text data to avoid TypeScript runtime/build issues.

export const MOCK_DATA_GUIDE = {
  quickStart: [
    'Open src/data/useMockData.ts',
    'Set USE_MOCK=true for frontend-only development',
    'Set USE_MOCK=false when backend endpoints are ready',
  ],
  includedData: [
    'MOCK_STARTUPS',
    'MOCK_MILESTONES',
    'MOCK_PORTFOLIO',
    'MOCK_USER',
    'MOCK_TRANSACTIONS',
    'MOCK_KYC_USERS',
    'MOCK_ADMIN_STATS',
  ],
  reminder: 'Keep this file documentation-only. Do not place executable UI example code here.',
} as const
