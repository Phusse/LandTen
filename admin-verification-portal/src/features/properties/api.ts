import { apiClient } from '../../lib/apiClient'

export interface PendingPropertyDocument {
  documentId: string
  documentType: string
  fileUrl: string
  createdAt: string
}

export interface PendingPropertyVerification {
  propertyId: string
  title: string
  address: string
  landlordId: string
  documents: PendingPropertyDocument[]
}

export async function getPendingPropertyVerifications(): Promise<PendingPropertyVerification[]> {
  const res = await apiClient.get('/admin/properties/pending-verification')
  return res.data
}

export async function approvePropertyVerification(propertyId: string): Promise<void> {
  await apiClient.post(`/admin/properties/${propertyId}/verify`)
}

export async function rejectPropertyVerification(propertyId: string): Promise<void> {
  await apiClient.post(`/admin/properties/${propertyId}/reject`)
}
