import { api } from '@/lib/apiClient'

// --- Types ---
export interface AdminUserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  verificationStatus: string
  status: string
  createdAt: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

// --- Users ---
export const getUsers = async (search?: string): Promise<PagedResult<AdminUserDto>> => {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  const response = await api.get(`/admin/users?${params.toString()}`)
  return response.data
}

export const getUserById = async (id: string): Promise<AdminUserDto> => {
  const response = await api.get(`/users/${id}`)
  return response.data
}

export const suspendUser = async (id: string, reason?: string) => {
  const response = await api.post(`/admin/users/${id}/suspend`, { reason })
  return response.data
}

export const reactivateUser = async (id: string, reason?: string) => {
  const response = await api.post(`/admin/users/${id}/reactivate`, { reason })
  return response.data
}

export const assignRole = async (id: string, role: string) => {
  const response = await api.post(`/admin/users/${id}/assign-role`, { role })
  return response.data
}

export const deleteUser = async (id: string, reason?: string) => {
  const response = await api.delete(`/admin/users/${id}`, { data: { reason } })
  return response.data
}

export const inviteAdmin = async (payload: any) => {
  const response = await api.post(`/admin/users/invite`, payload)
  return response.data
}

// --- KYC Verifications ---
export const getKycVerifications = async (status?: string) => {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  const response = await api.get(`/admin/kyc?${params.toString()}`)
  return response.data
}

export const approveKyc = async (id: string) => {
  const response = await api.post(`/admin/kyc/${id}/approve`)
  return response.data
}

export const rejectKyc = async (id: string) => {
  const response = await api.post(`/admin/kyc/${id}/reject`)
  return response.data
}

export const getKycSignedDocUrl = async (fileUrl: string): Promise<string> => {
  // Use the gateway document proxy — backend fetches the file, bypassing Cloudinary 401
  return `/proxy/document?url=${encodeURIComponent(fileUrl)}`
}

// --- Properties ---
export const getPropertyVerifications = async (status?: string) => {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  const response = await api.get(`/admin/properties?${params.toString()}`)
  return response.data
}

export const verifyProperty = async (id: string) => {
  const response = await api.post(`/admin/properties/${id}/verify`)
  return response.data
}

export const rejectProperty = async (id: string) => {
  const response = await api.post(`/admin/properties/${id}/reject`)
  return response.data
}

export const getPropertySignedDocUrl = async (fileUrl: string): Promise<string> => {
  // Use the gateway document proxy — backend fetches the file, bypassing Cloudinary 401
  return `/proxy/document?url=${encodeURIComponent(fileUrl)}`
}

// --- Audit Log ---
export const getAuditLog = async (pageSize = 100) => {
  const response = await api.get(`/admin/users/audit?pageSize=${pageSize}`)
  return response.data as AuditLogEntry[]
}

export interface AuditLogEntry {
  id: string
  action: string
  reason: string | null
  createdAt: string
  targetUserId: string
  targetName: string
  targetEmail: string
  performedBy: string
}
