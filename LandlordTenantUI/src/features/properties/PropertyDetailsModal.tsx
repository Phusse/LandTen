import { useState } from 'react'
import { X, MapPin, Bed, Bath, Home as HomeIcon, CheckCircle2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Badge } from '@/components/ui'
import type { Property } from './api'
import { applyToProperty } from '@/features/applications/api'
import { queryKeys } from '@/lib/queryKeys'
import { LandlordProfile } from './LandlordProfile'

interface PropertyDetailsModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
}

export function PropertyDetailsModal({ property, isOpen, onClose }: PropertyDetailsModalProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [showUnverifiedError, setShowUnverifiedError] = useState(false)
  const queryClient = useQueryClient()

  const { mutate: apply, isPending } = useMutation({
    mutationFn: () => applyToProperty(property!.id),
    onSuccess: () => {
      setShowSuccess(true)
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all })
      // Automatically close after showing success
      setTimeout(() => {
        handleClose()
      }, 2000)
    },
  })

  function handleApply() {
    if (property && !property.isVerified) {
      setShowUnverifiedError(true)
      return
    }
    apply()
  }

  function handleClose() {
    setShowSuccess(false)
    setShowUnverifiedError(false)
    onClose()
  }

  if (!isOpen || !property) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-harbour-primary/80 backdrop-blur-sm p-4 sm:p-6">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-harbour-bg shadow-2xl flex flex-col max-h-full">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40"
        >
          <X size={18} />
        </button>

        {/* Content Area - Scrollable */}
        <div className="overflow-y-auto">
          {/* Header Image */}
          <div className="relative h-64 w-full sm:h-80 bg-harbour-info-bg flex items-center justify-center">
            {property.image ? (
              <img src={property.image} alt={property.title} className="h-full w-full object-cover" />
            ) : (
              <HomeIcon size={64} className="text-harbour-primary opacity-30" />
            )}
            
            <div className="absolute bottom-4 left-4 flex gap-2">
              {property.badges.map((b) => (
                <Badge key={b.label} label={b.label} variant={b.variant} />
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 flex flex-col gap-6">
            {showUnverifiedError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500 mb-4">
                  <X size={32} />
                </div>
                <h3 className="font-display text-2xl font-semibold text-harbour-text mb-2">Verification Required</h3>
                <p className="text-harbour-text-secondary max-w-md mx-auto">
                  You cannot apply for {property.title} because it is currently pending review by our team. Please check back later once the property has been fully verified.
                </p>
                <Button variant="secondary" className="mt-6" onClick={() => setShowUnverifiedError(false)}>
                  Go Back
                </Button>
              </div>
            ) : showSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                <CheckCircle2 size={64} className="text-green-500 mb-4" />
                <h3 className="font-display text-2xl font-semibold text-harbour-text mb-2">Application Submitted!</h3>
                <p className="text-harbour-text-secondary">
                  Your application for {property.title} has been successfully sent to the landlord.
                </p>
              </div>
            ) : (
              <>
                {/* Title and Price */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-harbour-text">
                      {property.title}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-harbour-text-secondary">
                      <MapPin size={14} />
                      <span>{property.address}, {property.city}, {property.state}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0">
                    <p className="font-display text-xl font-bold text-harbour-accent">
                      {property.price}
                    </p>
                  </div>
                </div>

                {/* Key Features */}
                <div className="flex flex-wrap gap-4 border-y border-harbour-border py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-harbour-accent/10 text-harbour-accent">
                      <Bed size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-harbour-text-tertiary">Bedrooms</p>
                      <p className="font-medium text-harbour-text">{property.bedrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-harbour-accent/10 text-harbour-accent">
                      <Bath size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-harbour-text-tertiary">Bathrooms</p>
                      <p className="font-medium text-harbour-text">{property.bathrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-harbour-accent/10 text-harbour-accent">
                      <HomeIcon size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-harbour-text-tertiary">Property Type</p>
                      <p className="font-medium text-harbour-text">{property.propertyType}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-display text-lg font-medium text-harbour-text mb-2">About this property</h3>
                  <p className="text-sm leading-relaxed text-harbour-text-secondary whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>

                {/* Landlord Profile */}
                {property.landlordId && (
                  <div className="pt-4 border-t border-harbour-border mt-2">
                    <h3 className="font-display text-lg font-medium text-harbour-text mb-4">About the landlord</h3>
                    <LandlordProfile landlordId={property.landlordId} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {!showSuccess && !showUnverifiedError && (
          <div className="border-t border-harbour-border bg-harbour-surface p-4 sm:px-8 sm:py-5 flex items-center justify-end gap-3 mt-auto">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply} isLoading={isPending} disabled={isPending}>
              Apply Now
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
