import { Info } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { PropertyCard } from '../PropertyCard'
import type { AddPropertyFormValues } from './types'

interface Step3Props {
  form: UseFormReturn<AddPropertyFormValues>
  files: File[]
  documents: File[]
}

interface SummaryRowProps {
  label: string
  value: string
  last?: boolean
}

function SummaryRow({ label, value, last = false }: SummaryRowProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-3 text-sm ${
        !last ? 'border-b border-harbour-border' : ''
      }`}
    >
      <span className="text-harbour-text-secondary">{label}</span>
      <span className="text-right font-medium text-harbour-text">{value}</span>
    </div>
  )
}

export function Step3Review({ form, files, documents }: Step3Props) {
  const { getValues } = form
  const values = getValues()
  const fileCount = files.length
  const docCount = documents.length

  const formattedPrice = values.rentAmount
    ? `₦${Number(values.rentAmount).toLocaleString()} / ${
        values.paymentFrequency === 'Per month' ? 'month' : 'year'
      }`
    : '—'

  const addressFull = [values.address, values.city, values.state]
    .filter(Boolean)
    .join(', ')

  // Fake property shape for PropertyCard preview
  const previewProperty = {
    id: 'preview',
    title: values.title || 'Your property',
    price: formattedPrice,
    image: fileCount > 0 ? URL.createObjectURL(files[0]) : undefined,
    badges: [{ label: 'Pending verification', variant: 'warning' as const }],
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Preview card ─────────────────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-harbour-text-tertiary">
          How tenants will see this listing
        </p>
        <div className="max-w-xs">
          <PropertyCard property={previewProperty} />
        </div>
      </div>

      {/* ── Summary details ──────────────────────────────────────────────── */}
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-harbour-text-tertiary">
          Listing details
        </p>
        <div className="rounded-lg border border-harbour-border bg-harbour-surface px-4">
          <SummaryRow label="Type" value={values.propertyType || '—'} />
          <SummaryRow label="Address" value={addressFull || '—'} />
          <SummaryRow
            label="Bedrooms / Bathrooms"
            value={
              values.bedrooms && values.bathrooms
                ? `${values.bedrooms} bed · ${values.bathrooms} bath`
                : '—'
            }
          />
          <SummaryRow
            label="Photos"
            value={`${fileCount} photo${fileCount !== 1 ? 's' : ''} uploaded`}
          />
          <SummaryRow
            label="Verification Docs"
            value={`${docCount} document${docCount !== 1 ? 's' : ''} uploaded`}
            last
          />
        </div>
      </div>

      {/* ── Info notice ──────────────────────────────────────────────────── */}
      <div className="flex gap-3 rounded-lg bg-harbour-info-bg p-4">
        <Info
          size={18}
          className="mt-0.5 shrink-0 text-harbour-primary"
          strokeWidth={2}
        />
        <p className="text-sm leading-relaxed text-harbour-primary">
          Your listing will show as pending verification until our team reviews
          it, usually within 24 hours. Tenants can still see it, but it won't
          show the verified badge yet.
        </p>
      </div>
    </div>
  )
}
