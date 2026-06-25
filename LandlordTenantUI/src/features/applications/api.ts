import { api } from '@/lib/apiClient'

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface Application {
  id: string
  tenantId: string
  propertyId: string
  landlordId?: string  // resolved from property ownership
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

  // For each application, try to resolve the landlord by fetching the property
  const apps = data.map(app => ({
    ...app,
    tenantName: app.tenantName || 'Tenant',
    tenantInitials: app.tenantInitials || (app.tenantName ? `${app.tenantName[0]}` : 'TN'),
    propertyTitle: app.propertyTitle || 'Property',
    meta: app.meta || `Applied on ${new Date(app.createdAt).toLocaleDateString()}`,
    inspectionDate: app.inspectionDate ? new Date(app.inspectionDate).toLocaleString() : undefined
  }))

  // Batch-fetch property details to get landlordId for each unique propertyId
  const uniquePropertyIds = [...new Set(apps.map((a: any) => a.propertyId))]
  const propertyMap = new Map<string, string>()

  try {
    const propertyPromises = uniquePropertyIds.map(async (pid) => {
      try {
        const { data: prop } = await api.get<{ landlordId: string; ownerId: string }>(`/properties/${pid}`)
        propertyMap.set(pid, prop.landlordId || prop.ownerId)
      } catch {
        // Silently skip — property may not be accessible
      }
    })
    await Promise.all(propertyPromises)
  } catch {
    // Best-effort
  }

  return apps.map((app: any) => ({
    ...app,
    landlordId: propertyMap.get(app.propertyId) || undefined,
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
