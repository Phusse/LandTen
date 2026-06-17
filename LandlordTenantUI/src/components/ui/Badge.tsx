import { clsx } from 'clsx'

export type BadgeVariant = 'success' | 'warning' | 'neutral'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-harbour-success-bg text-harbour-success',
  warning: 'bg-harbour-warning-bg text-harbour-warning',
  neutral: 'bg-harbour-bg text-harbour-text-secondary',
}

export function Badge({ label, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {label}
    </span>
  )
}
