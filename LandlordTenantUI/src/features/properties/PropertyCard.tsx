import { Building2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
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
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })
  const [isHoverable, setIsHoverable] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    setIsHoverable(window.matchMedia('(hover: hover)').matches)
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHoverable || prefersReducedMotion || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const tiltX = ((y - centerY) / centerY) * -8
    const tiltY = ((x - centerX) / centerX) * 8

    requestAnimationFrame(() => {
      setTilt({ x: tiltX, y: tiltY })
      setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 })
    })
  }

  const handleMouseEnter = () => {
    if (!isHoverable || prefersReducedMotion) return
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    if (!isHoverable || prefersReducedMotion) return
    setIsHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="h-full"
      style={
        isHoverable && !prefersReducedMotion
          ? {
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: isHovered ? 'none' : 'transform 500ms ease-out',
              transformStyle: 'preserve-3d',
            }
          : undefined
      }
    >
      <Card className="flex flex-col h-full group hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
        {/* Photo */}
        <div className="overflow-hidden rounded-t-xl relative">
          {property.image ? (
            <img
              src={property.image}
              alt={property.title}
              className="h-32 w-full object-cover group-hover:scale-[1.04] transition-transform duration-300 ease-out"
            />
          ) : (
            <div className="flex h-32 items-center justify-center bg-harbour-info-bg group-hover:scale-[1.04] transition-transform duration-300 ease-out">
              <Building2
                size={48}
                className="text-harbour-primary opacity-[0.55]"
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2 p-4 z-10 relative bg-harbour-surface h-full">
          <h3 className="font-display text-base font-semibold leading-snug text-harbour-text">
            {property.title}
          </h3>
          <p className="text-sm text-harbour-text-secondary">{property.price}</p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 pt-0.5 mt-auto">
            {property.badges.map((b) => (
              <Badge key={b.label} label={b.label} variant={b.variant} />
            ))}
          </div>
        </div>

        {/* Glare Effect */}
        {isHoverable && !prefersReducedMotion && (
          <div 
            className="pointer-events-none absolute inset-0 z-50 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
            }}
          />
        )}
      </Card>
    </div>
  )
}

export function PropertyCardSkeleton() {
  return (
    <Card className="flex flex-col h-full relative overflow-hidden group">
      <div className="h-32 w-full rounded-t-xl bg-gradient-to-r from-harbour-border/30 via-harbour-border/60 to-harbour-border/30 bg-[length:200%_100%] animate-pulse" style={{ animationDuration: '2s' }} />
      <div className="flex flex-col gap-3 p-4 bg-harbour-surface h-full">
        <div className="h-5 w-3/4 rounded bg-harbour-border/40" />
        <div className="h-4 w-1/2 rounded bg-harbour-border/40" />
        <div className="flex gap-2 pt-1 mt-auto">
          <div className="h-6 w-16 rounded-full bg-harbour-border/40" />
          <div className="h-6 w-24 rounded-full bg-harbour-border/40" />
        </div>
      </div>
    </Card>
  )
}
