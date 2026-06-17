import { api } from '@/lib/apiClient'

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface Application {
  id: string
  tenantId: string
  propertyId: string
  propertyTitle: string
  tenantName: string
  tenantInitials: string
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn'
  createdAt: string
  meta: string  // pre-formatted display string, e.g. "3-bed flat · applied 2 days ago"
  inspectionDate?: string
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function getApplications(): Promise<Application[]> {
  const { data } = await api.get<any[]>('/applications')
  return data.map(app => ({
    ...app,
    tenantName: app.tenantName || 'Tenant',
    tenantInitials: app.tenantInitials || 'TN',
    propertyTitle: app.propertyTitle || 'Property',
    meta: app.meta || `Applied on ${new Date(app.createdAt).toLocaleDateString()}`,
    inspectionDate: app.inspectionDate ? new Date(app.inspectionDate).toLocaleString() : undefined
  }))
}

export async function updateApplicationStatus(
  id: string,
  status: 'Accepted' | 'Rejected',
): Promise<void> {
  await api.patch(`/applications/${id}/status`, { status })
}

export async function applyToProperty(propertyId: string): Promise<void> {
  await api.post('/applications', { propertyId })
}
