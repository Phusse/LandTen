import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { authStore } from '@/lib/authStore'
import {
  apiLogin,
  apiRefresh,
  apiRegister,
  type AuthUser,
  type RegisterPayload,
} from './api'

// ─── Storage key ────────────────────────────────────────────────────────────
// Security note: storing the refresh token in localStorage is convenient for
// silent session restore but is vulnerable to XSS. The more secure approach is
// to store it in an httpOnly cookie set by the server — this requires backend
// changes (Set-Cookie on the /auth/refresh response). Flagged as a future
// improvement once the backend team can coordinate.
const REFRESH_TOKEN_KEY = 'lt_refresh_token'
const DEV_USER_KEY = 'lt_dev_user'

// ─── Dev bypass ─────────────────────────────────────────────────────────────
// When VITE_API_BASE_URL is not set to a real backend, a mock session can be
// created so the UI can be explored without a running server.
// The Login page injects this via loginAsDemo().
export const DEV_DEMO_USER: AuthUser = {
  id: 'dev-001',
  email: 'tunde@landten.dev',
  firstName: 'Tunde',
  lastName: 'Adeola',
  phone: '+234 800 000 0001',
  role: 'Landlord',
  verificationStatus: 'Verified',
  createdAt: new Date().toISOString(),
}

// ─── Context shape ───────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginAsDemo: () => void          // ← dev bypass, no network call
  register: (payload: RegisterPayload) => Promise<{ verificationRequired: boolean }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logoutRef = useRef<() => void>(() => {})

  // ── Persist / clear helpers ────────────────────────────────────────────

  function applySession(accessToken: string, refreshToken: string, authUser: AuthUser) {
    authStore.setTokens(accessToken, refreshToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    setUser(authUser)
  }

  const clearSession = useCallback(() => {
    // Use clearTokens (not clearAuthState) to avoid infinite recursion:
    // clearAuthState fires onClearAuth which points back to clearSession itself.
    authStore.clearTokens()
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(DEV_USER_KEY)
    setUser(null)
  }, [])

  useEffect(() => {
    logoutRef.current = clearSession
    authStore.onClearAuth = clearSession
  }, [clearSession])

  // ── Silent restore on mount ────────────────────────────────────────────

  useEffect(() => {
    // 1. Check for a persisted dev-demo session first
    const devUser = localStorage.getItem(DEV_USER_KEY)
    if (devUser) {
      try {
        setUser(JSON.parse(devUser) as AuthUser)
      } catch {
        localStorage.removeItem(DEV_USER_KEY)
      }
      setIsLoading(false)
      return
    }

    // 2. Try a real token refresh if we have one
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!storedRefresh) {
      setIsLoading(false)
      return
    }

    apiRefresh(storedRefresh)
      .then(({ accessToken, refreshToken, user: refreshedUser }) => {
        const resolved: AuthUser = refreshedUser ?? {
          id: '',
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          role: 'Tenant',
          verificationStatus: 'Unverified',
          createdAt: new Date().toISOString(),
        }
        applySession(accessToken, refreshToken, resolved)
      })
      .catch(() => {
        clearSession()
      })
      .finally(() => {
        setIsLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Public actions ─────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken, user: loggedInUser } = await apiLogin(email, password)
    applySession(accessToken, refreshToken, loggedInUser)
  }, [])

  // Dev bypass — sets a fake in-memory user with no network call, persisted in
  // localStorage so a page refresh keeps the session alive during dev.
  const loginAsDemo = useCallback(() => {
    localStorage.setItem(DEV_USER_KEY, JSON.stringify(DEV_DEMO_USER))
    authStore.setTokens('dev-access-token', 'dev-refresh-token')
    setUser(DEV_DEMO_USER)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await apiRegister(payload)
    return { verificationRequired: result.verificationRequired }
  }, [])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginAsDemo, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
