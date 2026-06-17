import { useRef, useState } from 'react'
import { Upload, CheckCircle, Clock, XCircle, FileText } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { api } from '@/lib/apiClient'

type DocStatus = 'Verified' | 'Uploaded' | 'Rejected' | 'Not uploaded'

type KycDocument = {
  id: string
  name: string
  description: string
  status: DocStatus
}

// ── Status config ──────────────────────────────────────────────────────────
const statusConfig: Record<
  DocStatus,
  { icon: React.ReactNode; label: string; badgeVariant: 'success' | 'warning' | 'neutral' }
> = {
  Verified:     { icon: <CheckCircle size={15} className="text-harbour-success" />, label: 'Verified', badgeVariant: 'success' },
  Uploaded:     { icon: <Clock size={15} className="text-harbour-warning" />, label: 'Under review', badgeVariant: 'warning' },
  Rejected:     { icon: <XCircle size={15} className="text-red-500" />, label: 'Rejected', badgeVariant: 'neutral' },
  'Not uploaded': { icon: <FileText size={15} className="text-harbour-text-tertiary" />, label: 'Not uploaded', badgeVariant: 'neutral' },
}

// ── Single KYC document card ───────────────────────────────────────────────
function KycDocumentCard({ doc, onUploadSuccess }: { doc: KycDocument; onUploadSuccess: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const config = statusConfig[doc.status]
  const canUpload = doc.status === 'Not uploaded' || doc.status === 'Rejected'

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await api.postForm('/kyc/upload', {
        file: file,
        documentType: doc.name
      })
      onUploadSuccess()
    } catch (error) {
      console.error('Failed to upload KYC document', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      // reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="flex flex-col">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-harbour-text">{doc.name}</p>
          <p className="mt-0.5 text-sm text-harbour-text-secondary">{doc.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
          {config.icon}
          <Badge label={isUploading ? 'Uploading...' : config.label} variant={config.badgeVariant} />
        </div>
      </div>

      {/* Upload area — shown only when actionable */}
      {canUpload && (
        <div className="border-t border-harbour-border px-5 pb-5 pt-4">
          <div
            role="button"
            tabIndex={0}
            aria-label={`Upload ${doc.name}`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && !isUploading && fileInputRef.current?.click()}
            className={`flex items-center gap-3 rounded-lg border-2 border-dashed border-harbour-border px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbour-accent ${
              isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-harbour-accent/50 hover:bg-harbour-bg'
            }`}
          >
            <Upload size={18} className="shrink-0 text-harbour-text-tertiary" />
            <div>
              <p className="text-sm font-medium text-harbour-text">
                {isUploading ? 'Uploading...' : (doc.status === 'Rejected' ? 'Re-upload document' : 'Upload document')}
              </p>
              <p className="text-xs text-harbour-text-tertiary">
                JPG, PNG or PDF · max 5 MB
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </div>
      )}
    </Card>
  )
}

import { useQuery } from '@tanstack/react-query'

// ── Main screen ────────────────────────────────────────────────────────────
export default function Verification() {
  const { data: uploadedDocs, refetch } = useQuery<{ id: string; documentType: string; status: string }[]>({
    queryKey: ['kycDocuments'],
    queryFn: async () => {
      const res = await api.get('/kyc')
      return res.data
    },
  })

  const baseDocuments: KycDocument[] = [
    {
      id: 'doc-id',
      name: 'Government ID',
      description: 'Passport, driver’s license, or national ID card.',
      status: 'Not uploaded',
    },
    {
      id: 'doc-proof',
      name: 'Proof of Address',
      description: 'Utility bill or bank statement (less than 3 months old).',
      status: 'Not uploaded',
    },
  ]

  const kycDocuments: KycDocument[] = baseDocuments.map((doc) => {
    const matchingDocs = uploadedDocs?.filter((d) => d.documentType === doc.name) || []
    const serverDoc = matchingDocs[matchingDocs.length - 1] // Get the most recent one if multiple exist

    if (serverDoc) {
      return {
        ...doc,
        status:
          serverDoc.status.toLowerCase() === 'pending'
            ? 'Uploaded'
            : serverDoc.status.toLowerCase() === 'approved'
            ? 'Verified'
            : serverDoc.status.toLowerCase() === 'rejected'
            ? 'Rejected'
            : 'Not uploaded',
      }
    }
    return doc
  })

  const overallStatus = kycDocuments.every((d) => d.status === 'Verified')
    ? 'Verified'
    : kycDocuments.some((d) => d.status === 'Not uploaded' || d.status === 'Rejected')
    ? 'Action required'
    : 'Pending'

  const overallVariant =
    overallStatus === 'Verified' ? 'success' : overallStatus === 'Action required' ? 'neutral' : 'warning'

  const verifiedCount = kycDocuments.filter((d) => d.status === 'Verified').length

  const handleUploadSuccess = () => {
    refetch()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-semibold text-harbour-text">
              Verification
            </h1>
            <Badge label={overallStatus} variant={overallVariant} />
          </div>
          <p className="mt-1.5 text-sm text-harbour-text-secondary">
            {verifiedCount} of {kycDocuments.length} documents verified.
            Completing verification unlocks full platform access.
          </p>
        </div>
      </div>

      {/* ── Progress bar (segment style) ──────────────────────────────────── */}
      <div className="flex gap-1.5">
        {kycDocuments.map((doc) => (
          <div
            key={doc.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              doc.status === 'Verified'
                ? 'bg-harbour-success'
                : doc.status === 'Uploaded'
                ? 'bg-harbour-accent'
                : 'bg-harbour-border'
            }`}
          />
        ))}
      </div>

      {/* ── Info banner ───────────────────────────────────────────────────── */}
      <div className="rounded-lg bg-harbour-info-bg px-4 py-3.5">
        <p className="text-sm leading-relaxed text-harbour-primary">
          Our team reviews each document within 24 hours. You'll receive an
          email confirmation once your identity is verified.
        </p>
      </div>

      {/* ── Document cards ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {kycDocuments.map((doc) => (
          <KycDocumentCard key={doc.id} doc={doc} onUploadSuccess={handleUploadSuccess} />
        ))}
      </div>
    </div>
  )
}
