import { clsx } from 'clsx'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
  initials: string
  src?: string
  size?: AvatarSize
  className?: string
}

const sizes: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-20 w-20 text-2xl',
}

export function Avatar({ initials, src, size = 'md', className }: AvatarProps) {
  // Trim to max 2 characters for safety
  const label = initials.trim().slice(0, 2).toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        className={clsx(
          'inline-flex object-cover rounded-full shrink-0 select-none',
          sizes[size],
          className,
        )}
      />
    )
  }

  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center rounded-full',
        'bg-harbour-info-bg text-harbour-primary font-semibold',
        'shrink-0 select-none',
        sizes[size],
        className,
      )}
      aria-label={label}
    >
      {label}
    </div>
  )
}
