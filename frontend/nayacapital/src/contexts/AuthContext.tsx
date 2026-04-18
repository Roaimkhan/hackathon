import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { ALLOW_AUTH_FALLBACK_MOCK, FRONTEND_ONLY_MODE } from '../lib/runtimeMode'
import { normalizeUserRow } from '../lib/compat'

export interface User {
  id: string
  uid?: string
  user_id?: string
  email: string
  full_name: string
  role: 'investor' | 'founder' | 'admin'
  kyc_status: 'pending' | 'approved' | 'rejected'
  wallet_balance: number
  created_at?: string
  time?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    full_name: string,
    role?: 'investor' | 'founder' | 'admin'
  ) => Promise<void>
  refreshUser: () => Promise<void>
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  logout: () => Promise<void>
}

interface MockStoredUser extends User {
  password: string
}

const MOCK_USERS_KEY = 'naya_mock_users'
const MOCK_CURRENT_USER_KEY = 'naya_mock_user'
const AUTH_MODE_KEY = 'naya_auth_mode'

const isMockToken = (token: string | null) => Boolean(token && token.startsWith('mock-token-'))

const getMockUsers = (): MockStoredUser[] => {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY)
    return raw ? (JSON.parse(raw) as MockStoredUser[]) : []
  } catch {
    return []
  }
}

const setMockUsers = (users: MockStoredUser[]) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
}

const isAuthServiceUnavailable = (message: string) => {
  const lower = message.toLowerCase()
  return (
    lower.includes('rate limit') ||
    lower.includes('rate-limited') ||
    lower.includes('too many requests') ||
    lower.includes('email not confirmed') ||
    lower.includes('email not verified') ||
    lower.includes('failed to fetch') ||
    lower.includes('network error') ||
    lower.includes('timeout') ||
    lower.includes('temporarily unavailable')
  )
}

const createMockSession = (safeUser: User) => {
  localStorage.setItem('naya_token', `mock-token-${safeUser.id}`)
  localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(safeUser))
  localStorage.setItem(AUTH_MODE_KEY, 'mock')
}

const clearMockSession = () => {
  localStorage.removeItem('naya_token')
  localStorage.removeItem(MOCK_CURRENT_USER_KEY)
  localStorage.removeItem(AUTH_MODE_KEY)
}

const tryMockLogin = (email: string, password: string): User | null => {
  const users = getMockUsers()
  const found = users.find((u) => u.email === email && u.password === password)
  if (!found) return null
  const { password: _password, ...safeUser } = found
  return safeUser
}

const createMockUser = (
  email: string,
  password: string,
  full_name: string,
  role: 'investor' | 'founder' | 'admin'
): User => {
  const users = getMockUsers()
  const existing = users.find((u) => u.email === email)
  if (existing) {
    const { password: _password, ...safeUser } = existing
    return safeUser
  }

  const newUser: MockStoredUser = {
    id: `mock-${Date.now()}`,
    email,
    full_name,
    role,
    kyc_status: 'pending',
    wallet_balance: 0,
    password,
  }

  users.push(newUser)
  setMockUsers(users)
  const { password: _password, ...safeUser } = newUser
  return safeUser
}

const createMockUserFromLogin = (email: string, password: string): User | null => {
  const users = getMockUsers()
  const existing = users.find((u) => u.email === email)

  if (existing) {
    if (existing.password !== password) {
      return null
    }
    const { password: _password, ...safeUser } = existing
    return safeUser
  }

  const displayName = email.split('@')[0] || 'Investor'
  const newUser: MockStoredUser = {
    id: `mock-${Date.now()}`,
    email,
    full_name: displayName,
    role: 'investor',
    kyc_status: 'pending',
    wallet_balance: 0,
    password,
  }

  users.push(newUser)
  setMockUsers(users)
  const { password: _password, ...safeUser } = newUser
  return safeUser
}

const normalizeErrorValue = (value: unknown): string | null => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => normalizeErrorValue(item))
      .filter((item): item is string => Boolean(item))
    return parts.length ? parts.join(' | ') : null
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.msg === 'string') return obj.msg
    if (typeof obj.message === 'string') return obj.message
    if (typeof obj.detail === 'string') return obj.detail
    if (Array.isArray(obj.detail)) return normalizeErrorValue(obj.detail)
    const json = JSON.stringify(value)
    return json && json !== '{}' ? json : null
  }
  return String(value)
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const err = error as {
    response?: {
      data?: {
        detail?: unknown
        message?: unknown
      }
    }
    message?: unknown
  }

  const resolved = (
    normalizeErrorValue(err?.response?.data?.detail) ||
    normalizeErrorValue(err?.response?.data?.message) ||
    normalizeErrorValue(err?.message) ||
    fallback
  )

  if (resolved.toLowerCase().includes('email rate limit exceeded')) {
    return 'Registration is temporarily rate-limited by auth provider. Please retry in a minute.'
  }

  return resolved
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    const token = localStorage.getItem('naya_token')
    const hasMockSession = isMockToken(token) || localStorage.getItem(AUTH_MODE_KEY) === 'mock'
    if (FRONTEND_ONLY_MODE || (ALLOW_AUTH_FALLBACK_MOCK && hasMockSession)) {
      const rawUser = localStorage.getItem(MOCK_CURRENT_USER_KEY)
      if (rawUser) {
        setUser(JSON.parse(rawUser) as User)
      }
      return
    }

    if (hasMockSession) {
      clearMockSession()
      setUser(null)
      return
    }

    const { data } = await api.get('/auth/me')
    setUser(normalizeUserRow(data) as User)
  }

  useEffect(() => {
    if (FRONTEND_ONLY_MODE) {
      try {
        const rawUser = localStorage.getItem(MOCK_CURRENT_USER_KEY)
        if (rawUser) {
          setUser(JSON.parse(rawUser) as User)
        }
      } finally {
        setLoading(false)
      }
      return
    }

    const initAuth = async () => {
      try {
        const token = localStorage.getItem('naya_token')
        if (!token) {
          setUser(null)
          return
        }

        const hasMockSession = isMockToken(token) || localStorage.getItem(AUTH_MODE_KEY) === 'mock'
        if (hasMockSession) {
          if (!ALLOW_AUTH_FALLBACK_MOCK) {
            clearMockSession()
            setUser(null)
            return
          }
          const rawUser = localStorage.getItem(MOCK_CURRENT_USER_KEY)
          if (rawUser) {
            setUser(JSON.parse(rawUser) as User)
            return
          }
          clearMockSession()
          setUser(null)
          return
        }

        await refreshUser()
      } catch (error) {
        console.error('Auth initialization error:', error)
        clearMockSession()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)

      if (FRONTEND_ONLY_MODE) {
        const users = getMockUsers()
        const found = users.find((u) => u.email === email && u.password === password)

        if (!found) {
          throw new Error('Invalid email or password')
        }

        const { password: _password, ...safeUser } = found
        setUser(safeUser)
        localStorage.setItem('naya_token', `mock-token-${safeUser.id}`)
        localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(safeUser))
        return
      }

      const { data } = await api.post('/auth/login', {
        email,
        password,
      })

      localStorage.setItem('naya_token', data.access_token)
      localStorage.removeItem(AUTH_MODE_KEY)
      await refreshUser()
    } catch (error) {
      console.error('Login error:', error)
      const message = getApiErrorMessage(error, 'Login failed. Please try again.')

      // Fallback to local demo auth if backend auth is currently unavailable.
      if (!FRONTEND_ONLY_MODE && ALLOW_AUTH_FALLBACK_MOCK && isAuthServiceUnavailable(message)) {
        const safeUser = tryMockLogin(email, password) || createMockUserFromLogin(email, password)
        if (safeUser) {
          setUser(safeUser)
          createMockSession(safeUser)
          return
        }
      }

      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    email: string,
    password: string,
    full_name: string,
    role: 'investor' | 'founder' | 'admin' = 'investor'
  ) => {
    try {
      setLoading(true)

      if (FRONTEND_ONLY_MODE) {
        const users = getMockUsers()
        const exists = users.some((u) => u.email === email)
        if (exists) {
          throw new Error('Email already registered')
        }

        const newUser: MockStoredUser = {
          id: `mock-${Date.now()}`,
          email,
          full_name,
          role,
          kyc_status: 'pending',
          wallet_balance: 0,
          password,
        }

        users.push(newUser)
        setMockUsers(users)

        const { password: _password, ...safeUser } = newUser
        setUser(safeUser)
        localStorage.setItem('naya_token', `mock-token-${safeUser.id}`)
        localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(safeUser))
        return
      }

      await api.post('/auth/register', {
        email,
        password,
        full_name: full_name,
        role,
      })

      // Log in immediately after successful registration.
      const { data } = await api.post('/auth/login', {
        email,
        password,
      })
      localStorage.setItem('naya_token', data.access_token)
      localStorage.removeItem(AUTH_MODE_KEY)
      await refreshUser()
    } catch (error) {
      console.error('Register error:', error)
      const message = getApiErrorMessage(error, 'Registration failed. Please try again.')

      // If auth provider is rate-limited/unavailable, allow local demo registration fallback.
      if (!FRONTEND_ONLY_MODE && ALLOW_AUTH_FALLBACK_MOCK && isAuthServiceUnavailable(message)) {
        const safeUser = createMockUser(email, password, full_name, role)
        setUser(safeUser)
        createMockSession(safeUser)
        return
      }

      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)

      if (FRONTEND_ONLY_MODE) {
        setUser(null)
        localStorage.removeItem('naya_token')
        localStorage.removeItem(MOCK_CURRENT_USER_KEY)
        localStorage.removeItem(AUTH_MODE_KEY)
        return
      }

      setUser(null)
      localStorage.removeItem('naya_token')
      localStorage.removeItem(AUTH_MODE_KEY)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
