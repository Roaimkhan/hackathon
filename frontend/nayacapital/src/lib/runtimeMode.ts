const rawMode = import.meta.env.VITE_FRONTEND_ONLY_MODE
const rawAuthFallbackMode = import.meta.env.VITE_ALLOW_AUTH_FALLBACK_MOCK

// Default is false so the app integrates with backend unless explicitly overridden.
export const FRONTEND_ONLY_MODE = rawMode === 'true'

// Default is false so auth failures surface as real errors instead of silently creating mock users.
export const ALLOW_AUTH_FALLBACK_MOCK = rawAuthFallbackMode === 'true'
