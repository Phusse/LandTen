import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, RefreshCw, FileText, Home as HomeIcon } from 'lucide-react'
import { Button, ApplicationRowSkeleton, PropertyCardSkeleton } from '@/components/ui'
import { PropertyCard } from '@/features/properties/PropertyCard'
import { PropertyDetailsModal } from '@/features/properties/PropertyDetailsModal'
import { getApplications } from '@/features/applications/api'
import { getProperties, type Property } from '@/features/properties/api'
import { queryKeys } from '@/lib/queryKeys'
import { useAuth } from '@/features/auth/AuthContext'

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

export function TenantDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const firstName = user?.firstName ?? 'User'

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const {
    data: applications,
    isLoading: loadingApplications,
    isError: errorApplications,
    refetch: refetchApplications,
  } = useQuery({
    queryKey: queryKeys.applications.list(),
    queryFn: getApplications,
  })

  const {
    data: propertiesPage,
    isLoading: loadingProperties,
    isError: errorProperties,
    refetch: refetchProperties,
  } = useQuery({
    queryKey: queryKeys.properties.list(1),
    queryFn: () => getProperties(1),
  })

  const properties = propertiesPage?.items ?? []

  return (
    <div className="flex flex-col gap-8">
      {/* ── 1. Search First Hero ────────────────────────────────────────────── */}
      <section className="flex flex-col gap-6 rounded-2xl bg-harbour-accent/5 p-8 border border-harbour-border shadow-sm">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-semibold text-harbour-text">
            Find your next home, {firstName}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-harbour-text-secondary">
            Search top-rated properties in your desired location.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center max-w-2xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-harbour-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search by city or neighborhood..." 
              className="w-full rounded-lg border border-harbour-border py-2.5 pl-10 pr-4 text-sm focus:border-harbour-accent focus:outline-none focus:ring-1 focus:ring-harbour-accent"
              readOnly
              onClick={() => navigate('/search')} // or wherever the search page will be
            />
          </div>
          <Button variant="primary" onClick={() => navigate('/search')} className="w-full sm:w-auto px-8">
            Search
          </Button>
        </div>
      </section>

      {/* ── 2. Explore Properties ───────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-harbour-text flex items-center gap-2">
            <HomeIcon size={20} className="text-harbour-accent" />
            Explore Properties
          </h2>
          <Button variant="secondary" size="sm" onClick={() => navigate('/search')}>
            View all
          </Button>
        </div>

        {loadingProperties ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </div>
        ) : errorProperties ? (
          <ErrorBanner message="Couldn't load properties." onRetry={refetchProperties} />
        ) : properties.length === 0 ? (
          <div className="rounded-xl border border-dashed border-harbour-border bg-harbour-bg-subtle p-8 text-center flex flex-col items-center">
            <p className="text-harbour-text-secondary">No properties listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.slice(0, 4).map((property) => (
              <div key={property.id} onClick={() => setSelectedProperty(property)} className="cursor-pointer transition-transform hover:-translate-y-1">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 3. My Applications ──────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-harbour-text flex items-center gap-2">
            <FileText size={20} className="text-harbour-accent" />
            My Applications
          </h2>
          <Button variant="secondary" size="sm" onClick={() => navigate('/applications')}>
            View all
          </Button>
        </div>

        {loadingApplications ? (
          <div className="flex flex-col gap-3">
            <ApplicationRowSkeleton />
            <ApplicationRowSkeleton />
          </div>
        ) : errorApplications ? (
          <ErrorBanner message="Couldn't load applications." onRetry={refetchApplications} />
        ) : !applications || applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-harbour-border bg-harbour-bg-subtle p-8 text-center flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-harbour-bg flex items-center justify-center border border-harbour-border/50 mb-3">
              <FileText size={18} className="text-harbour-text-secondary" />
            </div>
            <p className="text-harbour-text font-medium text-sm">No applications yet</p>
            <p className="text-sm text-harbour-text-secondary mt-1 max-w-sm">
              When you find a property you love, you can apply for it directly and track its status here.
            </p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/search')}>
              Start exploring
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {applications.slice(0, 3).map((app) => (
              <div key={app.id} className="flex items-center justify-between rounded-xl border border-harbour-border bg-harbour-bg p-4 shadow-sm hover:border-harbour-border-hover transition-colors cursor-pointer" onClick={() => navigate('/applications')}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-harbour-accent/10 flex items-center justify-center text-harbour-accent font-medium">
                    {app.tenantInitials || 'P'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-harbour-text">Property Application</span>
                    <span className="text-xs text-harbour-text-secondary">{app.meta || 'Waiting for review'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {app.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <PropertyDetailsModal 
        property={selectedProperty} 
        isOpen={!!selectedProperty} 
        onClose={() => setSelectedProperty(null)} 
      />
    </div>
  )
}
