import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-md bg-harbour-border/60',
        className,
      )}
    />
  )
}

/** Matches the PropertyCard layout (h-32 image + text block) */
export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-harbour-border bg-harbour-surface shadow-sm">
      <Skeleton className="h-32 rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-1.5 pt-0.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
      </div>
    </div>
  )
}

/** Matches the ApplicationRow layout (avatar + text + two buttons) */
export function ApplicationRowSkeleton() {
  return (
    <div className="flex items-center gap-4 overflow-hidden rounded-lg border border-harbour-border bg-harbour-surface px-5 py-4 shadow-sm">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  )
}
