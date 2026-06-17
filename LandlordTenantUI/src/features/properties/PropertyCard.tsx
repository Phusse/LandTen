import { Building2 } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import type { BadgeVariant } from '@/components/ui/Badge'

// Accepts either the API Property shape or the mock shape —
// only the fields actually rendered are required.
export interface PropertyCardItem {
  id: string
  title: string
  price: string
  image?: string
  badges: { label: string; variant: BadgeVariant }[]
}

interface PropertyCardProps {
  property: PropertyCardItem
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="flex flex-col">
      {/* Photo */}
      {property.image ? (
        <img
          src={property.image}
          alt={property.title}
          className="h-32 w-full object-cover rounded-t-xl"
        />
      ) : (
        <div className="flex h-32 items-center justify-center bg-harbour-info-bg rounded-t-xl">
          <Building2
            size={48}
            className="text-harbour-primary opacity-[0.55]"
            strokeWidth={1.5}
          />
        </div>
      )}

      {/* Details */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-display text-base font-semibold leading-snug text-harbour-text">
          {property.title}
        </h3>
        <p className="text-sm text-harbour-text-secondary">{property.price}</p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {property.badges.map((b) => (
            <Badge key={b.label} label={b.label} variant={b.variant} />
          ))}
        </div>
      </div>
    </Card>
  )
}
