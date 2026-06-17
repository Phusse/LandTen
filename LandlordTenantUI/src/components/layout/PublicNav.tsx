import { Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui'
import { useState, useEffect } from 'react'

export function PublicNav() {
  const [isOpen, setIsOpen] = useState(false)

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <nav className="sticky top-0 z-50 border-b border-harbour-border bg-harbour-bg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden lg:flex lg:items-center lg:gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-harbour-text-secondary hover:text-harbour-text">
            How it works
          </a>
          <a href="#for-landlords" className="text-sm font-medium text-harbour-text-secondary hover:text-harbour-text">
            For landlords
          </a>
          <a href="#faq" className="text-sm font-medium text-harbour-text-secondary hover:text-harbour-text">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex lg:items-center">
            <Link to="/login">
              <Button variant="secondary">
                Log in
              </Button>
            </Link>
          </div>
          <Link to="/register">
            <Button variant="primary">
              Get started
            </Button>
          </Link>
          <button 
            className="lg:hidden text-harbour-text-secondary p-1.5 -mr-1.5 rounded-md hover:bg-harbour-surface transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-40 flex flex-col justify-between overflow-y-auto border-t border-harbour-border bg-harbour-bg p-4 lg:hidden">
          <div className="flex flex-col divide-y divide-harbour-border/50">
            <a 
              href="#how-it-works" 
              onClick={() => setIsOpen(false)} 
              className="flex min-h-[44px] items-center py-3 text-base font-medium text-harbour-text"
            >
              How it works
            </a>
            <a 
              href="#for-landlords" 
              onClick={() => setIsOpen(false)} 
              className="flex min-h-[44px] items-center py-3 text-base font-medium text-harbour-text"
            >
              For landlords
            </a>
            <a 
              href="#faq" 
              onClick={() => setIsOpen(false)} 
              className="flex min-h-[44px] items-center py-3 text-base font-medium text-harbour-text"
            >
              FAQ
            </a>
          </div>
          <div className="mt-8 flex flex-col gap-3 pb-8">
            <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
              <Button variant="secondary" className="min-h-[44px] w-full justify-center text-base">
                Log in
              </Button>
            </Link>
            <Link to="/register" onClick={() => setIsOpen(false)} className="w-full">
              <Button variant="primary" className="min-h-[44px] w-full justify-center text-base">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
