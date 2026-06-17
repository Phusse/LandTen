import { api } from '@/lib/apiClient'

export interface ProfileResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: string
  verificationStatus: string
  avatarUrl: string | null
  createdAt: string
}

export async function getMyProfile(): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>('/users/me')
  return data
}

export async function updateMyProfile(payload: { firstName: string; lastName: string }): Promise<void> {
  await api.patch('/users/me', payload)
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
  await api.patch('/users/me/password', payload)
}

export async function uploadAvatar(file: File): Promise<void> {
  const form = new FormData()
  form.append('file', file)
  await api.post('/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export interface PublicProfileResponse {
  firstName: string
  lastName: string
  avatarUrl: string | null
  isVerified: boolean
  memberSince: string
}

export async function getPublicLandlordProfile(landlordId: string): Promise<PublicProfileResponse> {
  const { data } = await api.get<PublicProfileResponse>(`/users/${landlordId}/public-profile`)
  return data
}
