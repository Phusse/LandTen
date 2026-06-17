// ─── In-memory auth store ─────────────────────────────────────────────────────
// AuthContext (Batch 6) is the source of truth for user state. This store
// gives the apiClient interceptor (Batch 5) synchronous access to the current
// access token and a way to trigger logout without a circular import.
//
// Flow:
//  AuthContext.applySession() → authStore.setTokens()
//  AuthContext wires: authStore.onClearAuth = clearSession
//  apiClient 401 interceptor → authStore.clearAuthState() → onClearAuth()
//     → AuthContext clears user state → ProtectedRoute redirects to /login

let _accessToken: string | null = null
let _refreshToken: string | null = null

// Overwritten by AuthContext after mount so the interceptor can trigger logout
let _onClearAuth: (() => void) | null = null

export const authStore = {
  getAccessToken: () => _accessToken || null,
  getRefreshToken: () => _refreshToken || null,

  setTokens: (access: string, refresh: string) => {
    _accessToken = access
    _refreshToken = refresh
  },

  // Called by AuthContext.clearSession() directly — clears tokens only,
  // does NOT trigger onClearAuth to avoid the infinite recursion:
  //   clearSession → clearAuthState → onClearAuth → clearSession → ...
  clearTokens: () => {
    _accessToken = null
    _refreshToken = null
  },

  // Called ONLY by the 401 interceptor in apiClient to trigger a full logout
  // cascade: apiClient interceptor → clearAuthState → onClearAuth → clearSession
  clearAuthState: () => {
    _accessToken = null
    _refreshToken = null
    _onClearAuth?.()
  },

  set onClearAuth(fn: () => void) {
    _onClearAuth = fn
  },
}
