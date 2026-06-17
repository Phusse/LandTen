import axios, { type AxiosInstance } from 'axios'
import { authStore } from './authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor — attach Bearer token ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = authStore.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor — handle 401 / token refresh ───────────────────────
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(token: string | null, error: unknown = null) {
  pendingQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)))
  pendingQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // Only attempt refresh on 401, not on the refresh call itself
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue this request until the in-flight refresh resolves
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          },
          reject,
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const refreshToken = authStore.getRefreshToken()
      if (!refreshToken) throw new Error('No refresh token')

      const { data } = await axios.post<{
        accessToken: string
        refreshToken: string
      }>(`${BASE_URL}/auth/refresh`, { refreshToken })

      authStore.setTokens(data.accessToken, data.refreshToken)
      api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`
      original.headers.Authorization = `Bearer ${data.accessToken}`

      processQueue(data.accessToken)
      return api(original)
    } catch (refreshError) {
      processQueue(null, refreshError)
      authStore.clearAuthState()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
