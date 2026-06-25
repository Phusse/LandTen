import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FileText, MessageCircle, Clock, RefreshCw } from 'lucide-react'
import { Button, Chip, PropertyCardSkeleton, ApplicationRowSkeleton } from '@/components/ui'
import { PropertyCard } from '@/features/properties/PropertyCard'
import { ApplicationRow } from './ApplicationRow'
import { getMyProperties } from '@/features/properties/api'
import { getApplications, updateApplicationStatus } from '@/features/applications/api'
import { queryKeys } from '@/lib/queryKeys'
import { useAuth } from '@/features/auth/AuthContext'

function pl(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

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

export function LandlordDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { user } = useAuth()
  const firstName = user?.firstName ?? 'User'

  // TODO: Replace these with real APIs when built.
  const newApplications = 0
  const unreadMessages = 0
  const pendingVerification = 0

  const {
    data: propertiesPage,
    isLoading: loadingProperties,
    isError: errorProperties,
    refetch: refetchProperties,
  } = useQuery({
    queryKey: queryKeys.properties.list(1),
    queryFn: () => getMyProperties(1),
  })

  const {
    data: applications,
    isLoading: loadingApplications,
    isError: errorApplications,
    refetch: refetchApplications,
  } = useQuery({
    queryKey: queryKeys.applications.list(),
    queryFn: getApplications,
  })

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Accepted' | 'Rejected' }) =>
      updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all })
    },
  })

  const properties = propertiesPage?.items ?? []
  const propertyCount = propertiesPage?.totalCount ?? 0

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div className="max-w-prose">
          <h1 className="font-display text-3xl font-semibold text-harbour-text">
            Good morning, {firstName}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-harbour-text-secondary">
            You have{' '}
            <span className="font-medium text-harbour-text">
              {pl(propertyCount, 'listed property', 'listed properties')}
            </span>
            ,{' '}
            <span className="font-medium text-harbour-text">
              {pl(newApplications, 'new application')}
            </span>
            , and{' '}
            <span className="font-medium text-harbour-text">
              {pl(pendingVerification, 'verification')} pending
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip label={pl(newApplications, 'new application')} variant="info" icon={<FileText />} />
          <Chip label={pl(unreadMessages, 'unread message')} variant="neutral" icon={<MessageCircle />} />
          <Chip label={`${pl(pendingVerification, 'verification')} pending`} variant="warning" icon={<Clock />} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-harbour-text">
            Your properties
          </h2>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => navigate('/properties/new')}
          >
            Add property
          </Button>
        </div>

        {loadingProperties ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </div>
        ) : errorProperties ? (
          <ErrorBanner message="Couldn't load your properties." onRetry={refetchProperties} />
        ) : properties.length === 0 ? (
          <p className="text-sm text-harbour-text-secondary">
            No properties listed yet.{' '}
            <button
              className="underline hover:text-harbour-text"
              onClick={() => navigate('/properties/new')}
            >
              Add your first one.
            </button>
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-harbour-text">
          Recent applications
        </h2>

        {loadingApplications ? (
          <div className="flex flex-col gap-3">
            <ApplicationRowSkeleton />
            <ApplicationRowSkeleton />
          </div>
        ) : errorApplications ? (
          <ErrorBanner message="Couldn't load applications." onRetry={refetchApplications} />
        ) : !applications || applications.length === 0 ? (
          <p className="text-sm text-harbour-text-secondary">
            No applications yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {applications.map((app) => (
              <ApplicationRow
                key={app.id}
                application={{
                  id: app.id,
                  initials: app.tenantInitials,
                  name: app.tenantName,
                  meta: app.meta,
                  status: app.status,
                }}
                onAccept={(id) => changeStatus({ id, status: 'Accepted' })}
                onDecline={(id) => changeStatus({ id, status: 'Rejected' })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
