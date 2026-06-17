import { Link, Outlet, useLocation } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../features/auth/AuthContext'

export function AppShell() {
  const { logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-harbour-bg font-body flex flex-col">
      <header className="bg-harbour-primary text-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-8">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-harbour-accent" />
              <span className="font-display font-bold text-lg">LandTen Admin</span>
            </div>
            {/* Show logout on top right for mobile, or right side for desktop */}
            <div className="sm:hidden">
              <Button variant="secondary" size="sm" onClick={logout} className="text-harbour-primary">
                Log out
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-4 flex-1">
            <nav className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar w-full sm:w-auto">
              <Link
                to="/kyc"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  location.pathname.startsWith('/kyc')
                    ? 'bg-harbour-accent text-harbour-primary'
                    : 'text-gray-300 hover:bg-harbour-primary-soft hover:text-white'
                }`}
              >
                KYC Reviews
              </Link>
              <Link
                to="/properties"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  location.pathname.startsWith('/properties')
                    ? 'bg-harbour-accent text-harbour-primary'
                    : 'text-gray-300 hover:bg-harbour-primary-soft hover:text-white'
                }`}
              >
                Property Reviews
              </Link>
              <Link
                to="/users"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  location.pathname.startsWith('/users')
                    ? 'bg-harbour-accent text-harbour-primary'
                    : 'text-gray-300 hover:bg-harbour-primary-soft hover:text-white'
                }`}
              >
                Users
              </Link>
            </nav>
            <div className="hidden sm:block shrink-0">
              <Button variant="secondary" size="sm" onClick={logout} className="text-harbour-primary">
                Log out
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
