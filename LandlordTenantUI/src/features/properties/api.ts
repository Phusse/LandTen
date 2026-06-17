import { api } from '@/lib/apiClient'

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface PropertyBadge {
  label: string
  variant: 'success' | 'warning' | 'neutral'
}

export interface Property {
  id: string
  landlordId?: string
  isVerified: boolean
  title: string
  price: string        // formatted display string built client-side
  rentPrice: number
  rentFrequency: string
  propertyType: string
  address: string
  city: string
  state: string
  description: string
  bedrooms: number
  bathrooms: number
  status: string
  badges: PropertyBadge[]
  image?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// ─── Request payload ──────────────────────────────────────────────────────────

export interface CreatePropertyPayload {
  title: string
  propertyType: string
  address: string
  city: string
  state: string
  description: string
  rentPrice: number
  rentFrequency: string  // "Per year" | "Per month"
  bedrooms: number
  bathrooms: number
  // TODO: verify these field names/casing against the actual PropertyService
  // DTOs once both projects are running together — the .NET side may use
  // different casing (e.g. "RentAmount" vs "rentPrice") or omit rentFrequency.
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function getProperties(
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<Property>> {
  // We type the raw response to know what the backend sends
  const { data } = await api.get<PaginatedResponse<any>>('/properties', {
    params: { page, pageSize },
  })

  // Map the backend DTO to the frontend UI model
  data.items = data.items.map((p: any) => {
    const rentPrice = typeof p.rentPrice === 'number' ? p.rentPrice : 0;
    const isVerified = p.verified === true;
    
    return {
      ...p,
      landlordId: p.landlordId || p.LandlordId,
      isVerified,
      price: `₦${rentPrice.toLocaleString()} / year`,
      bedrooms: p.rooms || 1,
      bathrooms: p.bathrooms || 1,
      propertyType: p.propertyType || 'Apartment',
      image: p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : undefined,
      badges: [
        isVerified
          ? { label: 'Verified', variant: 'success' }
          : { label: 'Pending verification', variant: 'warning' },
      ],
    }
  })

  return data
}

export async function getMyProperties(
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<Property>> {
  const { data } = await api.get<PaginatedResponse<any>>('/properties/my', {
    params: { page, pageSize },
  })

  data.items = data.items.map((p: any) => {
    const rentPrice = typeof p.rentPrice === 'number' ? p.rentPrice : 0;
    const isVerified = p.verified === true;
    
    return {
      ...p,
      landlordId: p.landlordId || p.LandlordId,
      isVerified,
      price: `₦${rentPrice.toLocaleString()} / year`,
      bedrooms: p.rooms || 1,
      bathrooms: p.bathrooms || 1,
      propertyType: p.propertyType || 'Apartment',
      image: p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : undefined,
      badges: [
        isVerified
          ? { label: 'Verified', variant: 'success' }
          : { label: 'Pending verification', variant: 'warning' },
      ],
    }
  })

  return data
}

export async function createProperty(
  payload: CreatePropertyPayload,
): Promise<{ propertyId: string }> {
  const backendPayload = {
    title: payload.title,
    description: payload.description,
    address: payload.address,
    city: payload.city,
    state: payload.state,
    rentPrice: payload.rentPrice,
    rooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    propertyType: payload.propertyType,
  }
  const { data } = await api.post<{ propertyId: string }>('/properties', backendPayload)
  return data
}

export async function getPropertyById(id: string): Promise<Property> {
  const { data } = await api.get<any>(`/properties/${id}`)
  
  const isVerified = data.verified === true
  const rentPrice = typeof data.rentPrice === 'number' ? data.rentPrice : 0
  
  return {
    ...data,
    landlordId: data.landlordId || data.LandlordId,
    isVerified,
    price: `₦${rentPrice.toLocaleString()} / year`,
    bedrooms: data.rooms || 1,
    bathrooms: data.bathrooms || 1,
    propertyType: data.propertyType || 'Apartment',
    image: data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls[0] : undefined,
    badges: [
      isVerified
        ? { label: 'Verified', variant: 'success' }
        : { label: 'Pending verification', variant: 'warning' },
    ],
  }
}

export async function updateProperty(id: string, payload: Omit<CreatePropertyPayload, 'rentFrequency'>): Promise<void> {
  const backendPayload = {
    title: payload.title,
    description: payload.description,
    address: payload.address,
    city: payload.city,
    state: payload.state,
    rentPrice: payload.rentPrice,
    rooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    propertyType: payload.propertyType,
  }
  await api.put(`/properties/${id}`, backendPayload)
}

export async function deleteProperty(id: string): Promise<void> {
  await api.delete(`/properties/${id}`)
}

export async function uploadPropertyImage(
  propertyId: string,
  file: File,
): Promise<void> {
  const form = new FormData()
  form.append('file', file)
  await api.post(`/properties/${propertyId}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function uploadPropertyDocument(
  propertyId: string,
  file: File,
  documentType: string,
): Promise<void> {
  const form = new FormData()
  form.append('file', file)
  form.append('documentType', documentType)
  await api.post(`/properties/${propertyId}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
