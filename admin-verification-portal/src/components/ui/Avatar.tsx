import { clsx } from 'clsx'

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback: string
  className?: string
}

export function Avatar({ src, alt, fallback, className }: AvatarProps) {
  return (
    <div
      className={clsx(
        'relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-harbour-bg',
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-medium text-harbour-text-secondary">{fallback}</span>
      )}
    </div>
  )
}
