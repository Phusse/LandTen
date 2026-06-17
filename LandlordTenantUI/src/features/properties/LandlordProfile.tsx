import { useQuery } from '@tanstack/react-query'
import { getPublicLandlordProfile } from '@/features/settings/api'
import { Avatar, Badge } from '@/components/ui'

export function LandlordProfile({ landlordId }: { landlordId: string }) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['landlord-profile', landlordId],
    queryFn: () => getPublicLandlordProfile(landlordId),
    enabled: !!landlordId,
  })

  if (isLoading || !profile) {
    return (
      <div className="flex items-center gap-3 p-4 bg-harbour-surface border border-harbour-border rounded-xl animate-pulse">
        <div className="h-12 w-12 rounded-full bg-harbour-border/50" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 bg-harbour-border/50 rounded" />
          <div className="h-3 w-24 bg-harbour-border/50 rounded" />
        </div>
      </div>
    )
  }

  const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase()

  return (
    <div className="flex items-center gap-4 p-4 bg-harbour-surface border border-harbour-border rounded-xl">
      <Avatar initials={initials} src={profile.avatarUrl || undefined} size="lg" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h4 className="font-display font-medium text-harbour-text">
            {profile.firstName} {profile.lastName}
          </h4>
          {profile.isVerified && (
            <Badge label="Verified landlord" variant="success" />
          )}
        </div>
        <p className="text-xs text-harbour-text-tertiary">
          Member since {profile.memberSince}
        </p>
      </div>
    </div>
  )
}
