import { useState } from 'react'
import { Card, CardContent } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { type PendingKyc } from './api'

interface Props {
  document: PendingKyc
  onApprove: (id: string) => void
  onReject: (id: string) => void
  isApproving: boolean
  isRejecting: boolean
}

export function KycReviewCard({ document, onApprove, onReject, isApproving, isRejecting }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const isPdf = document.fileUrl.toLowerCase().endsWith('.pdf')

  // Derive initials
  const initials = document.userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const formattedDate = new Date(document.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Card className="mb-6">
      <CardContent className="flex flex-col gap-6">
        {/* Header: User Info */}
        <div className="flex items-center gap-4">
          <Avatar fallback={initials || '?'} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-harbour-text">{document.userName}</h3>
              <Badge label={document.userRole} variant="neutral" />
            </div>
            <p className="text-sm text-harbour-text-secondary">{document.userEmail}</p>
          </div>
          <div className="text-sm text-harbour-text-secondary">{formattedDate}</div>
        </div>

        {/* Document details */}
        <div>
          <h4 className="text-sm font-medium text-harbour-text mb-2">{document.documentType}</h4>
          
          <div className="rounded-lg border border-harbour-border bg-harbour-bg p-2 overflow-hidden flex items-center justify-center">
            {isPdf ? (
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-harbour-accent font-medium hover:underline p-8"
              >
                View document (PDF)
              </a>
            ) : (
              <div className="relative flex flex-col items-center">
                <img
                  src={document.fileUrl}
                  alt={document.documentType}
                  className="max-h-64 max-w-full object-contain rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.innerHTML = `
                      <div class="p-8 text-center text-sm text-harbour-text-secondary">
                        Could not load preview — <a href="${document.fileUrl}" target="_blank" class="text-harbour-accent hover:underline">open directly</a>
                      </div>
                    `
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          {showConfirm ? (
            <>
              <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={isRejecting}>
                Cancel
              </Button>
              <Button variant="primary" className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700" onClick={() => onReject(document.id)} isLoading={isRejecting}>
                Confirm Reject
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setShowConfirm(true)} disabled={isApproving}>
              Reject
            </Button>
          )}

          {!showConfirm && (
            <Button variant="primary" onClick={() => onApprove(document.id)} isLoading={isApproving}>
              Approve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
