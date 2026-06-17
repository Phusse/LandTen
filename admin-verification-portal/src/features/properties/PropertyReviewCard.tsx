import { useState } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { type PendingPropertyVerification } from './api'

interface Props {
  property: PendingPropertyVerification
  onApprove: (id: string) => void
  onReject: (id: string) => void
  isApproving: boolean
  isRejecting: boolean
}

export function PropertyReviewCard({ property, onApprove, onReject, isApproving, isRejecting }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display text-lg font-semibold text-harbour-primary">{property.title}</h3>
            <p className="text-sm text-harbour-text-secondary mt-1">{property.address}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-harbour-text-tertiary">Landlord ID</span>
            <p className="text-sm font-mono text-harbour-text-secondary truncate w-32 sm:w-auto" title={property.landlordId}>
              {property.landlordId}
            </p>
            {/* TODO: Resolve landlord name via UserService */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-4">
        {/* Document list */}
        <div className="space-y-6">
          {property.documents.map((doc) => {
            const isPdf = doc.fileUrl.toLowerCase().endsWith('.pdf')
            const formattedDate = new Date(doc.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <div key={doc.documentId} className="space-y-2">
                <div className="flex justify-between items-end">
                  <h4 className="text-sm font-medium text-harbour-text">{doc.documentType}</h4>
                  <span className="text-xs text-harbour-text-secondary">{formattedDate}</span>
                </div>
                <div className="rounded-lg border border-harbour-border bg-harbour-bg p-2 overflow-hidden flex items-center justify-center">
                  {isPdf ? (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-harbour-accent font-medium hover:underline p-8"
                    >
                      View document (PDF)
                    </a>
                  ) : (
                    <div className="relative flex flex-col items-center">
                      <img
                        src={doc.fileUrl}
                        alt={doc.documentType}
                        className="max-h-64 max-w-full object-contain rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.parentElement!.innerHTML = `
                            <div class="p-8 text-center text-sm text-harbour-text-secondary">
                              Could not load preview — <a href="${doc.fileUrl}" target="_blank" class="text-harbour-accent hover:underline">open directly</a>
                            </div>
                          `
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-harbour-border mt-2">
          {showConfirm ? (
            <>
              <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={isRejecting}>
                Cancel
              </Button>
              <Button variant="primary" className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700" onClick={() => onReject(property.propertyId)} isLoading={isRejecting}>
                Confirm Reject
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setShowConfirm(true)} disabled={isApproving}>
              Reject
            </Button>
          )}

          {!showConfirm && (
            <Button variant="primary" onClick={() => onApprove(property.propertyId)} isLoading={isApproving}>
              Approve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
