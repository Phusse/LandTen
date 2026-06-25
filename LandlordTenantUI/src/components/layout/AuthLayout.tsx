import type { ReactNode } from 'react'
import { Logo } from '@/components/ui'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-harbour-bg">
      {/* Left Column: Image (Hidden on < lg) */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <img
          src="/images/landing/hero.jpg"
          alt="Nigeria residential street"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Scrim for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        
        {/* Branding Overlay */}
        <div className="relative z-10 p-8">
          <Logo variant="dark" />
        </div>
      </div>

      {/* Right Column: Form Area */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Branding (Visible only on < lg) */}
          <div className="mb-8 flex lg:hidden flex-col items-center gap-3">
            <Logo markSize="h-12 w-12" />
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>
    </div>
  )
}
