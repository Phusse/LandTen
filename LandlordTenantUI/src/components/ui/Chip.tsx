import { type ReactNode } from 'react'
import { clsx } from 'clsx'

type Variant = 'success' | 'warning' | 'neutral' | 'info'

interface ChipProps {
  label: string
  variant?: Variant
  icon?: ReactNode
  className?: string
}

const variants: Record<Variant, string> = {
  success: 'bg-harbour-success-bg text-harbour-success',
  warning: 'bg-harbour-warning-bg text-harbour-warning',
  neutral: 'bg-harbour-bg text-harbour-text-secondary',
  info:    'bg-harbour-info-bg text-harbour-primary',
}

export function Chip({ label, variant = 'neutral', icon, className }: ChipProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium',
        variants[variant],
        className,
      )}
    >
      {icon && <span className="shrink-0 [&>svg]:size-4">{icon}</span>}
      {label}
    </span>
  )
}
