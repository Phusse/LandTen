import { apiClient } from '../../lib/apiClient'

export interface PendingKyc {
  id: string
  userId: string
  userName: string
  userEmail: string
  userRole: string
  documentType: string
  fileUrl: string
  createdAt: string
}

export async function getPendingKyc(): Promise<PendingKyc[]> {
  const res = await apiClient.get('/admin/kyc/pending')
  return res.data
}

export async function approveKyc(documentId: string): Promise<void> {
  await apiClient.post(`/admin/kyc/${documentId}/approve`)
}

export async function rejectKyc(documentId: string): Promise<void> {
  await apiClient.post(`/admin/kyc/${documentId}/reject`)
}
