import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Select, Card } from '@/components/ui'
import { getPropertyById, updateProperty } from './api'
import { queryKeys } from '@/lib/queryKeys'

export default function EditProperty() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: property, isLoading, isError } = useQuery({
    queryKey: queryKeys.properties.detail(id!),
    queryFn: () => getPropertyById(id!),
    enabled: !!id,
  })

  const [formData, setFormData] = useState({
    title: '',
    propertyType: 'Apartment',
    address: '',
    city: '',
    state: '',
    description: '',
    rentPrice: '',
    bedrooms: '',
    bathrooms: '',
  })

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        propertyType: property.propertyType || 'Apartment',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        description: property.description || '',
        rentPrice: (property.rentPrice || '').toString(),
        bedrooms: (property.bedrooms || 1).toString(),
        bathrooms: (property.bathrooms || 1).toString(),
      })
    }
  }, [property])

  const { mutate: doUpdate, isPending } = useMutation({
    mutationFn: (data: any) => updateProperty(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all })
      navigate('/properties')
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 rounded-full border-4 border-harbour-border border-t-harbour-accent animate-spin" />
      </div>
    )
  }

  if (isError || !property) {
    return <div className="p-12 text-center text-red-500">Failed to load property details.</div>
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    doUpdate({
      ...formData,
      rentPrice: Number(formData.rentPrice) || 0,
      bedrooms: Number(formData.bedrooms) || 1,
      bathrooms: Number(formData.bathrooms) || 1,
    })
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-harbour-text">Edit property</h1>
      </div>
      
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="font-display text-xl font-medium text-harbour-text">Property details</h2>
        </div>
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input 
              label="Title" 
              required 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
            />
            
            <Select
              label="Property type"
              value={formData.propertyType}
              onChange={e => setFormData({ ...formData, propertyType: e.target.value })}
              options={[
                { value: 'Apartment', label: 'Apartment' },
                { value: 'Duplex', label: 'Duplex' },
                { value: 'Bungalow', label: 'Bungalow' },
                { value: 'Mini Flat', label: 'Mini Flat' },
                { value: 'Self Con', label: 'Self Con' },
              ]}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-harbour-text">Description</label>
              <textarea
                className="min-h-[100px] w-full rounded-xl border border-harbour-border bg-white px-4 py-2.5 text-harbour-text outline-none transition-colors placeholder:text-harbour-text-tertiary focus:border-harbour-accent focus:ring-1 focus:ring-harbour-accent/20"
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Bedrooms" 
                type="number" 
                min="0" 
                required 
                value={formData.bedrooms} 
                onChange={e => setFormData({ ...formData, bedrooms: e.target.value })} 
              />
              <Input 
                label="Bathrooms" 
                type="number" 
                min="0" 
                required 
                value={formData.bathrooms} 
                onChange={e => setFormData({ ...formData, bathrooms: e.target.value })} 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <Input 
                  label="Address" 
                  required 
                  value={formData.address} 
                  onChange={e => setFormData({ ...formData, address: e.target.value })} 
                />
              </div>
              <Input 
                label="City" 
                required 
                value={formData.city} 
                onChange={e => setFormData({ ...formData, city: e.target.value })} 
              />
              <Input 
                label="State" 
                required 
                value={formData.state} 
                onChange={e => setFormData({ ...formData, state: e.target.value })} 
              />
              <Input 
                label="Rent Price (₦/yr)" 
                type="number" 
                min="0" 
                required 
                value={formData.rentPrice} 
                onChange={e => setFormData({ ...formData, rentPrice: e.target.value })} 
              />
            </div>

            <div className="flex items-center gap-3 justify-end pt-4 border-t border-harbour-border">
              <Button type="button" variant="secondary" onClick={() => navigate('/properties')}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={isPending}>Save changes</Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
