import { type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-harbour-surface border border-harbour-border rounded-lg shadow-sm overflow-hidden',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
