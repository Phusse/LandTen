import { useState, useMemo } from 'react'
import { Search as SearchIcon, RefreshCw, Filter } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button, PropertyCardSkeleton } from '@/components/ui'
import { PropertyCard } from '@/features/properties/PropertyCard'
import { PropertyDetailsModal } from '@/features/properties/PropertyDetailsModal'
import { getProperties, type Property } from '@/features/properties/api'
import { queryKeys } from '@/lib/queryKeys'

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
      <p className="text-sm text-red-700">{message}</p>
      <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const {
    data: propertiesPage,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.properties.list(1),
    queryFn: () => getProperties(1),
  })

  const properties = propertiesPage?.items ?? []

  // Local filtering by title or city
  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) return properties
    
    const lowerTerm = searchTerm.toLowerCase()
    return properties.filter(p => 
      p.title.toLowerCase().includes(lowerTerm) || 
      p.city.toLowerCase().includes(lowerTerm) ||
      p.address.toLowerCase().includes(lowerTerm)
    )
  }, [properties, searchTerm])

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header & Search Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-harbour-text">
            Search Properties
          </h1>
          <p className="mt-1 text-sm text-harbour-text-secondary">
            Find the perfect place to call home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-harbour-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search by title, city, or address..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-harbour-border py-2.5 pl-10 pr-4 text-sm focus:border-harbour-accent focus:outline-none focus:ring-1 focus:ring-harbour-accent bg-harbour-bg shadow-sm"
            />
          </div>
          <Button variant="secondary" icon={<Filter size={16} />} className="sm:w-auto w-full">
            Filters
          </Button>
        </div>
      </div>

      {/* ── Results Grid ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </div>
      ) : isError ? (
        <ErrorBanner message="Couldn't load properties." onRetry={refetch} />
      ) : filteredProperties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-harbour-border bg-harbour-bg-subtle p-12 text-center flex flex-col items-center">
          <SearchIcon size={32} className="text-harbour-text-secondary mb-4 opacity-50" />
          <h3 className="font-display text-lg font-medium text-harbour-text">No properties found</h3>
          <p className="text-harbour-text-secondary mt-1 max-w-md">
            {searchTerm 
              ? `We couldn't find any properties matching "${searchTerm}". Try adjusting your search.` 
              : "There are currently no properties listed. Check back later!"}
          </p>
          {searchTerm && (
            <Button variant="secondary" className="mt-6" onClick={() => setSearchTerm('')}>
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <div key={property.id} onClick={() => setSelectedProperty(property)} className="cursor-pointer transition-transform hover:-translate-y-1">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      )}

      {/* ── Property Details Modal ─────────────────────────────────────────── */}
      <PropertyDetailsModal 
        property={selectedProperty} 
        isOpen={!!selectedProperty} 
        onClose={() => setSelectedProperty(null)} 
      />
    </div>
  )
}
