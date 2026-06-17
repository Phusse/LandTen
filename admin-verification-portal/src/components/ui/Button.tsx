import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'outline-accent'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  isLoading?: boolean
  className?: string
}

const base = [
  'inline-flex items-center justify-center gap-2',
  'rounded-lg',
  'font-body font-semibold',
  'transition-colors duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbour-accent focus-visible:ring-offset-2',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

const variants: Record<Variant, string> = {
  primary:
    'bg-harbour-accent text-harbour-primary hover:bg-harbour-accent-hover active:bg-harbour-accent-hover',
  secondary:
    'bg-harbour-surface border border-harbour-border text-harbour-text hover:bg-harbour-bg',
  'outline-accent':
    'bg-harbour-surface border border-harbour-accent text-harbour-accent-hover hover:bg-harbour-accent/5',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 py-2.5 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled ?? isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  )
}
