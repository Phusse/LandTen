import { Pencil, Trash2, Bed, Bath } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import type { BadgeVariant } from '@/components/ui/Badge'

export interface MockPropertyItem {
  id: string
  title: string
  address: string
  price: string
  bedrooms: number
  bathrooms: number
  badges: { label: string; variant: BadgeVariant }[]
}

interface PropertyRowProps {
  property: MockPropertyItem
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function PropertyRow({ property, onEdit, onDelete }: PropertyRowProps) {
  return (
    <Card className="flex items-center gap-4 px-5 py-4">
      {/* Colour block / type indicator */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-harbour-info-bg text-harbour-primary">
        <Bed size={20} strokeWidth={1.75} />
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display font-semibold text-harbour-text">
          {property.title}
        </p>
        <p className="mt-0.5 truncate text-sm text-harbour-text-secondary">
          {property.address}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {property.badges.map((b) => (
            <Badge key={b.label} label={b.label} variant={b.variant} />
          ))}
        </div>
      </div>

      {/* Price + beds/baths — hidden on xs */}
      <div className="hidden flex-col items-end gap-1 sm:flex">
        <p className="text-sm font-semibold text-harbour-text">{property.price}</p>
        <div className="flex items-center gap-3 text-xs text-harbour-text-secondary">
          <span className="flex items-center gap-1">
            <Bed size={12} /> {property.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <Bath size={12} /> {property.bathrooms} bath
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          title="Edit property"
          aria-label={`Edit ${property.title}`}
          onClick={() => onEdit?.(property.id)}
          className="rounded-lg p-2 text-harbour-text-tertiary hover:bg-harbour-bg hover:text-harbour-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbour-accent"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          title="Delete property"
          aria-label={`Delete ${property.title}`}
          onClick={() => onDelete?.(property.id)}
          className="rounded-lg p-2 text-harbour-text-tertiary hover:bg-red-50 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Card>
  )
}
