// VGC Logo — renders inline SVG shield mark + "VGC" wordmark in Zilla Slab.
// Fully supports light and dark variants with no external image files required.

export interface LogoProps {
  markSize?: string       // Tailwind size classes, e.g. "h-8 w-8"
  showWordmark?: boolean
  variant?: 'light' | 'dark'  // light = dark text on light bg, dark = white on dark bg
  gap?: string            // Tailwind gap class between mark and wordmark
}

export function Logo({
  markSize = 'h-9 w-9',
  showWordmark = true,
  variant = 'light',
  gap = 'gap-2.5',
}: LogoProps) {
  const wordColor = variant === 'dark' ? 'text-white' : 'text-harbour-primary'
  const shieldFill = variant === 'dark' ? '#FFFFFF' : '#1F3B40'
  const accentFill = variant === 'dark' ? '#1F3B40' : '#E0922F'

  return (
    <div className={`flex items-center ${gap}`}>
      {/* Shield Mark SVG */}
      <svg
        className={`shrink-0 ${markSize}`}
        viewBox="0 0 40 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Shield body */}
        <path
          d="M20 2L4 8.5V21C4 30.5 11 39.5 20 42C29 39.5 36 30.5 36 21V8.5L20 2Z"
          fill={shieldFill}
        />
        {/* Accent checkmark */}
        <path
          d="M13 22l5 5 9-10"
          stroke={accentFill}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={`font-display text-xl font-semibold tracking-tight leading-none ${wordColor}`}
        >
          VGC
        </span>
      )}
    </div>
  )
}
