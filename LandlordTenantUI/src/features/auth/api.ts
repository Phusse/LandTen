import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

// Use a plain axios instance (not the intercepted `api`) to avoid
// circular dependency: AuthContext -> apiClient -> authStore -> AuthContext
const authAxios = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Shapes ────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: 'Tenant' | 'Landlord' | 'Admin'
  verificationStatus: 'Unverified' | 'Pending' | 'Verified' | 'Rejected'
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser
}

export interface RegisterPayload {
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
  role: 'Tenant' | 'Landlord'
}

export interface RegisterResponse {
  userId: string
  verificationRequired: boolean
  user: AuthUser
}

export interface RefreshResponse extends AuthTokens {
  user: AuthUser
}

// ─── API calls ─────────────────────────────────────────────────────────────

export async function apiLogin(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await authAxios.post<LoginResponse>('/auth/login', {
    email,
    password,
  })

  // Ensure role and status are properly capitalized to match TypeScript union
  data.user.role = (data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)) as any;
  data.user.verificationStatus = (data.user.verificationStatus.charAt(0).toUpperCase() + data.user.verificationStatus.slice(1)) as any;

  return data
}

export async function apiRegister(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const { data } = await authAxios.post<RegisterResponse>(
    '/auth/register',
    payload,
  )
  return data
}

export async function apiRefresh(
  refreshToken: string,
): Promise<RefreshResponse> {
  const { data } = await authAxios.post<RefreshResponse>('/auth/refresh', {
    refreshToken,
  })
  return data
}
