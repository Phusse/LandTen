import { clsx } from 'clsx'

interface ProgressBarProps {
  /** Total number of segments */
  totalSteps: number
  /** 0-indexed current step — all segments at index <= currentStep are filled */
  currentStep: number
  className?: string
}

export function ProgressBar({ totalSteps, currentStep, className }: ProgressBarProps) {
  return (
    <div
      className={clsx('flex w-full flex-row gap-1', className)}
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={clsx(
            'h-1 flex-1 rounded-full transition-colors duration-200',
            i <= currentStep ? 'bg-harbour-accent' : 'bg-harbour-border',
          )}
        />
      ))}
    </div>
  )
}
