import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, PropertyCardSkeleton } from '@/components/ui'
import { PropertyRow } from './PropertyRow'
import { getMyProperties, deleteProperty } from './api'
import { queryKeys } from '@/lib/queryKeys'

export default function Properties() {
  const navigate = useNavigate()

  const {
    data: propertiesPage,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.properties.list(1),
    queryFn: () => getMyProperties(1),
  })

  const properties = propertiesPage?.items ?? []
  const propertyCount = propertiesPage?.totalCount ?? 0

  const queryClient = useQueryClient()

  const { mutate: removeProperty } = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all })
    },
  })

  function handleEdit(id: string) {
    navigate(`/properties/${id}/edit`)
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this property?')) {
      removeProperty(id)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-harbour-text">
          Your properties
        </h1>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => navigate('/properties/new')}
        >
          Add property
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3 mt-4">
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 mt-4">
          <p className="text-sm text-red-700">Couldn't load your properties.</p>
          <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : properties.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-harbour-border bg-harbour-bg-subtle p-12 text-center">
          <p className="text-harbour-text-secondary">No properties listed yet.</p>
          <button
            className="mt-2 text-sm font-medium text-harbour-accent hover:underline"
            onClick={() => navigate('/properties/new')}
          >
            Add your first property
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-harbour-text-secondary">
            {propertyCount} propert{propertyCount === 1 ? 'y' : 'ies'} listed
          </p>

          <div className="flex flex-col gap-3">
            {properties.map((property) => (
              <PropertyRow
                key={property.id}
                property={property}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
