import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('naya_token')
    const isMockToken = token?.startsWith('mock-token-')
    if (token && !isMockToken) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error?.config?.url || ''
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')
    const token = localStorage.getItem('naya_token')
    const isMockToken = token?.startsWith('mock-token-') || localStorage.getItem('naya_auth_mode') === 'mock'

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !isAuthEndpoint && !isMockToken) {
      // Clear token and redirect to login if needed
      localStorage.removeItem('naya_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
