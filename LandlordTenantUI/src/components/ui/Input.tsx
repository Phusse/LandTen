import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
}

const fieldBase = [
  'w-full rounded-lg border border-harbour-border bg-harbour-surface',
  'px-3 py-2.5 text-sm text-harbour-text placeholder:text-harbour-text-tertiary',
  'focus:outline-none focus:ring-2 focus:ring-harbour-accent/20 focus:border-harbour-accent',
  'transition-colors duration-150',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id: externalId, ...props }, ref) => {
    const autoId = useId()
    const id = externalId ?? autoId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-harbour-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx(
            fieldBase,
            error && 'border-red-400 focus:ring-red-300/30 focus:border-red-400',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'
