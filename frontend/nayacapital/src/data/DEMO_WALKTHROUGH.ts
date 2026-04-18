// Demo walkthrough notes represented as serializable data.
// Keeping this file free of JSX prevents accidental build failures.

export const DEMO_WALKTHROUGH = [
  {
    title: 'Investor views startups',
    flow: [
      'Navigate to /startups',
      'useStartups checks USE_MOCK',
      'mock list returns after simulated delay',
    ],
  },
  {
    title: 'Investor places investment',
    flow: [
      'Open startup detail page',
      'submit investment amount',
      'mock invest handler returns simulated success payload',
    ],
  },
  {
    title: 'Founder submits milestone proof',
    flow: [
      'Open founder dashboard',
      'choose milestone and upload proof',
      'mock submit handler updates milestone status',
    ],
  },
] as const
