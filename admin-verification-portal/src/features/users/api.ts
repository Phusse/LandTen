import { apiClient } from '../../lib/apiClient'

export interface UserRow {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  createdAt: string
  avatarUrl: string | null
}

export interface PaginatedUsers {
  items: UserRow[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export async function getUsers(params: { role?: string; status?: string; page?: number }): Promise<PaginatedUsers> {
  const { data } = await apiClient.get<PaginatedUsers>('/admin/users', { params })
  return data
}

export async function suspendUser(userId: string, reason?: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/suspend`, { reason })
}

export async function reactivateUser(userId: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/reactivate`)
}
