import { Anchor } from 'lucide-react'

export interface LogoProps {
  markSize?: string
  showWordmark?: boolean
  wordmarkClassName?: string
  variant?: 'light' | 'dark'
  fallbackBgClass?: string
  fallbackIconClass?: string
  fallbackIconSize?: number
  gap?: string
}

export function Logo({
  markSize = 'h-10 w-10',
  showWordmark = true,
  wordmarkClassName = 'h-6 object-contain',
  variant = 'light',
  fallbackBgClass = 'bg-harbour-accent',
  fallbackIconClass = 'text-harbour-primary',
  fallbackIconSize = 20,
  gap = 'gap-3',
}: LogoProps) {
  const fallbackTextColor = variant === 'dark' ? 'text-white' : 'text-harbour-primary'
  
  // If we are on a dark background and the wordmark is dark text, 
  // we apply brightness-0 invert to make it white so it remains legible.
  const finalWordmarkClass = variant === 'dark' 
    ? `${wordmarkClassName} brightness-0 invert`
    : wordmarkClassName

  return (
    <div className={`flex items-center ${gap}`}>
      {/* Logo Mark */}
      <div className={`relative flex ${markSize} shrink-0 items-center justify-center rounded-lg overflow-hidden`}>
        <img 
          src="/logo.png" 
          alt="VGC Logo" 
          className="h-full w-full object-contain" 
          onError={(e) => { 
            e.currentTarget.style.display = 'none'; 
            e.currentTarget.nextElementSibling?.classList.remove('hidden') 
          }} 
        />
        <div className={`hidden absolute inset-0 ${fallbackBgClass} flex items-center justify-center`}>
          <Anchor size={fallbackIconSize} className={fallbackIconClass} strokeWidth={2.5} />
        </div>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <>
          <img 
            src="/wordmark.png" 
            alt="VGC" 
            className={finalWordmarkClass} 
            onError={(e) => { 
              e.currentTarget.style.display = 'none'; 
              e.currentTarget.nextElementSibling?.classList.remove('hidden') 
            }} 
          />
          <span className={`hidden font-display text-xl font-semibold tracking-tight ${fallbackTextColor}`}>
            VGC
          </span>
        </>
      )}
    </div>
  )
}
