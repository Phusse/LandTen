import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle } from 'lucide-react'
import { getPendingKyc, approveKyc, rejectKyc } from './api'
import { KycReviewCard } from './KycReviewCard'
import { Badge } from '../../components/ui/Badge'

export function KycQueue() {
  const queryClient = useQueryClient()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const { data: pendingDocs, isLoading, error, refetch } = useQuery({
    queryKey: ['pendingKyc'],
    queryFn: getPendingKyc,
  })

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const approveMutation = useMutation({
    mutationFn: approveKyc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingKyc'] })
      showToast('Approved')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectKyc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingKyc'] })
      showToast('Rejected')
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-48 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-32 w-full bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 text-red-700 rounded-2xl border border-red-100">
        <h2 className="text-lg font-medium mb-2">Failed to load KYC reviews</h2>
        <p className="text-sm mb-4 text-red-600">Please check your connection and try again.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
        >
          Retry request
        </button>
      </div>
    )
  }

  const isEmpty = !pendingDocs || pendingDocs.length === 0

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-harbour-primary text-white px-4 py-2 rounded shadow-lg animate-in fade-in slide-in-from-bottom-4 z-50">
          {toastMessage}
        </div>
      )}

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-display font-semibold text-harbour-primary">KYC Reviews</h1>
        <Badge label={pendingDocs?.length?.toString() || '0'} variant="neutral" />
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-harbour-surface rounded-2xl border border-harbour-border border-dashed">
          <CheckCircle className="h-12 w-12 text-harbour-success mb-4" />
          <h2 className="text-lg font-medium text-harbour-primary">No pending KYC submissions</h2>
          <p className="text-harbour-text-secondary mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingDocs.map(doc => (
            <KycReviewCard
              key={doc.id}
              document={doc}
              onApprove={(id) => approveMutation.mutate(id)}
              onReject={(id) => rejectMutation.mutate(id)}
              isApproving={approveMutation.isPending && approveMutation.variables === doc.id}
              isRejecting={rejectMutation.isPending && rejectMutation.variables === doc.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
