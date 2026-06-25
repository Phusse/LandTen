
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui'
import { useState, useEffect } from 'react'

export function PublicNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-harbour-bg border-b border-harbour-border shadow-sm' : 'bg-transparent border-transparent'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden lg:flex lg:items-center lg:gap-8">
          <a href="#how-it-works" className={`text-sm font-medium transition-colors ${scrolled ? 'text-harbour-text-secondary hover:text-harbour-text' : 'text-white/90 hover:text-white'}`}>
            How it works
          </a>
          <a href="#for-landlords" className={`text-sm font-medium transition-colors ${scrolled ? 'text-harbour-text-secondary hover:text-harbour-text' : 'text-white/90 hover:text-white'}`}>
            For landlords
          </a>
          <a href="#faq" className={`text-sm font-medium transition-colors ${scrolled ? 'text-harbour-text-secondary hover:text-harbour-text' : 'text-white/90 hover:text-white'}`}>
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex lg:items-center">
            <Link to="/login">
              <Button variant="secondary" className={scrolled ? '' : 'bg-white/10 text-white hover:bg-white/20 border-transparent backdrop-blur-sm'}>
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
            className={`lg:hidden relative h-10 w-10 flex items-center justify-center rounded-md transition-colors ${scrolled ? 'hover:bg-harbour-surface' : 'hover:bg-white/10'}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <div className="flex flex-col justify-between w-5 h-[14px] transform transition-all duration-300 origin-center overflow-hidden">
              <span className={`bg-current h-[2px] w-full transform transition-all duration-300 origin-left ${isOpen ? 'translate-x-10' : ''}`}></span>
              <span className={`bg-current h-[2px] w-full rounded transform transition-all duration-300 ${isOpen ? 'translate-x-10 delay-75' : ''}`}></span>
              <span className={`bg-current h-[2px] w-full transform transition-all duration-300 origin-left ${isOpen ? 'translate-x-10 delay-150' : ''}`}></span>

              {/* X icon overlay */}
              <div className={`absolute items-center justify-between transform transition-all duration-500 top-2.5 -translate-x-10 flex w-0 ${isOpen ? 'w-12 translate-x-0' : ''}`}>
                <span className={`absolute bg-current h-[2px] w-5 transform transition-all duration-500 rotate-0 delay-300 ${isOpen ? 'rotate-45' : ''}`}></span>
                <span className={`absolute bg-current h-[2px] w-5 transform transition-all duration-500 -rotate-0 delay-300 ${isOpen ? '-rotate-45' : ''}`}></span>
              </div>
            </div>
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
