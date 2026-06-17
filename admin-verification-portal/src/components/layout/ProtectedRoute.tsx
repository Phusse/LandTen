import { Navigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { AppShell } from './AppShell'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-harbour-bg">
        <span className="h-8 w-8 shrink-0 animate-spin rounded-full border-4 border-harbour-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <AppShell />
}
