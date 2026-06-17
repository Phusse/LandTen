import { useState } from 'react'
import { clsx } from 'clsx'
import { Calendar, RefreshCw } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar, Badge, Button, Card, ApplicationRowSkeleton } from '@/components/ui'
import { getApplications, updateApplicationStatus } from './api'
import { queryKeys } from '@/lib/queryKeys'

// Match the AppStatus type from the API response
type AppStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Expired' | 'Withdrawn'
type FilterTab = 'All' | AppStatus

const TABS: FilterTab[] = ['All', 'Pending', 'Accepted', 'Rejected']

const statusVariant: Record<AppStatus, 'neutral' | 'success' | 'warning'> = {
  Pending: 'warning',
  Accepted: 'success',
  Rejected: 'neutral',
  Expired: 'neutral',
  Withdrawn: 'neutral',
}

export function LandlordApplications() {
  const [activeTab, setActiveTab] = useState<FilterTab>('All')
  const queryClient = useQueryClient()

  const {
    data: applications,
    isLoading,
    isError,
    refetch,
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

  const allApplications = applications ?? []
  
  const filtered = allApplications.filter(
    (a) => activeTab === 'All' || a.status === activeTab,
  )

  const pendingCount = allApplications.filter(a => a.status === 'Pending').length

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-3xl font-semibold text-harbour-text">
          Received Applications
        </h1>
        <p className="mt-1 text-sm text-harbour-text-secondary">
          {allApplications.length} total · {pendingCount} pending
        </p>
      </div>

      {/* ── Filter chips ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors duration-150',
              activeTab === tab
                ? 'border-harbour-accent bg-harbour-accent/10 text-harbour-accent-hover'
                : 'border-harbour-border bg-harbour-surface text-harbour-text-secondary hover:bg-harbour-bg hover:text-harbour-text',
            )}
          >
            {tab}
            {tab !== 'All' && (
               <span className="ml-1.5 text-xs opacity-60">
                 ({allApplications.filter((a) => a.status === tab).length})
               </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Application list ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <ApplicationRowSkeleton />
            <ApplicationRowSkeleton />
          </>
        ) : isError ? (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 mt-4">
            <p className="text-sm text-red-700">Couldn't load applications.</p>
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-harbour-border bg-harbour-bg-subtle p-12 text-center">
            <p className="text-harbour-text-secondary">No {activeTab.toLowerCase()} applications.</p>
          </div>
        ) : (
          filtered.map((app) => (
            <Card key={app.id} className="flex flex-col gap-0">
              {/* Row — avatar + info + status + actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="flex min-w-[200px] flex-1 items-center gap-4">
                  <Avatar initials={app.tenantInitials} size="md" className="shrink-0" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-harbour-text">{app.tenantName}</p>
                      <Badge
                        label={app.status}
                        variant={statusVariant[app.status]}
                      />
                    </div>
                    <p className="mt-0.5 truncate text-sm text-harbour-text-secondary">
                      {app.meta}
                    </p>
                  </div>
                </div>

                {/* Actions — only for pending */}
                {app.status === 'Pending' && (
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => changeStatus({ id: app.id, status: 'Rejected' })}>Decline</Button>
                    <Button variant="outline-accent" size="sm" onClick={() => changeStatus({ id: app.id, status: 'Accepted' })}>Accept</Button>
                  </div>
                )}
              </div>

              {/* Inspection date footer — if present */}
              {app.inspectionDate && (
                <div className="flex items-center gap-2 border-t border-harbour-border bg-harbour-bg px-5 py-2.5">
                  <Calendar size={14} className="shrink-0 text-harbour-text-tertiary" />
                  <p className="text-xs text-harbour-text-secondary">
                    Inspection: <span className="font-medium text-harbour-text">{app.inspectionDate}</span>
                  </p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
