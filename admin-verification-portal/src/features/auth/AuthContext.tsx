import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiClient } from '../../lib/apiClient'

const REFRESH_TOKEN_KEY = 'lt_admin_refresh'
const ACCESS_TOKEN_KEY = 'token'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(window.atob(base64))
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const clearSession = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    setIsAuthenticated(false)
  }, [])

  const applySession = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    const checkSession = async () => {
      const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!storedRefresh) {
        setIsLoading(false)
        return
      }

      try {
        const res = await apiClient.post('/auth/refresh', { refreshToken: storedRefresh })
        applySession(res.data.accessToken, res.data.refreshToken)
      } catch {
        clearSession()
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [applySession, clearSession])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password })
    const { accessToken, refreshToken } = res.data

    const payload = parseJwt(accessToken)
    const role = payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload?.role

    if (role?.toLowerCase() !== 'admin') {
      throw new Error('This portal is for admin accounts only')
    }

    applySession(accessToken, refreshToken)
  }, [applySession])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
