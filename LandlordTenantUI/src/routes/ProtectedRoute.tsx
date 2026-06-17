import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // While the silent token restore is in progress show nothing (or a spinner)
  // to avoid a flash-redirect to /login on a valid returning session.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-harbour-bg">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-harbour-border border-t-harbour-accent" />
      </div>
    )
  }

  if (!user) {
    // Pass the attempted location so Login can redirect back after auth
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}

interface RoleRouteProps {
  allowedRoles: string[]
  children?: React.ReactNode
}

export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user } = useAuth()
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  // If used as a layout wrapper (Outlet) or wrapping children
  return children ? <>{children}</> : null
}
