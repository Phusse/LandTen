import { Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute, RoleRoute } from './ProtectedRoute'
import { Outlet } from 'react-router-dom'

// ── Route-level code splitting ────────────────────────────────────────────
const Dashboard    = lazy(() => import('@/features/dashboard/Dashboard'))
const Properties   = lazy(() => import('@/features/properties/Properties'))
const AddProperty  = lazy(() => import('@/features/properties/AddProperty'))
const EditProperty = lazy(() => import('@/features/properties/EditProperty'))
const Applications = lazy(() => import('@/features/applications/Applications'))
const Messages     = lazy(() => import('@/features/messages/Messages'))
const Verification = lazy(() => import('@/features/auth/Verification'))
const Settings     = lazy(() => import('@/features/settings/Settings'))
const Search       = lazy(() => import('@/features/search/Search'))

// Admin Features
const AnalyticsDashboard = lazy(() => import('@/features/admin/AnalyticsDashboard'))
const AdminManagement    = lazy(() => import('@/features/admin/AdminManagement'))
const AdminVerifications = lazy(() => import('@/features/admin/AdminVerifications'))
const AdminProperties    = lazy(() => import('@/features/admin/AdminProperties'))
const AdminUsers         = lazy(() => import('@/features/admin/AdminUsers'))
const AdminSettings      = lazy(() => import('@/features/admin/AdminSettings'))
const Login        = lazy(() => import('@/features/auth/Login'))
const Register     = lazy(() => import('@/features/auth/Register'))
const Landing      = lazy(() => import('@/features/landing/Landing'))
const NotFound     = lazy(() => import('@/features/NotFound'))

// Full-page spinner shown while a lazy chunk loads
function RouteSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-harbour-bg">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-harbour-border border-t-harbour-accent" />
    </div>
  )
}
export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteSpinner />}>
      <Routes>
        {/* ── Public landing page ────────────────────────────────────────── */}
        <Route path="/" element={<Landing />} />

        {/* ── Public auth pages ──────────────────────────────────────────── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected shell-wrapped routes ─────────────────────────────── */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route element={<RoleRoute allowedRoles={['Landlord']}><Outlet /></RoleRoute>}>
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/new" element={<AddProperty />} />
            <Route path="/properties/:id/edit" element={<EditProperty />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={['Tenant']}><Outlet /></RoleRoute>}>
            <Route path="/search" element={<Search />} />
          </Route>

          <Route path="/applications" element={<Applications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/settings" element={<Settings />} />

          {/* ── Admin Routes: Accessible by both Admin + SuperAdmin ────────── */}
          <Route element={<RoleRoute allowedRoles={['Admin', 'SuperAdmin']}><Outlet /></RoleRoute>}>
            <Route path="/admin/dashboard" element={<AnalyticsDashboard />} />
            <Route path="/admin/verifications" element={<AdminVerifications />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* ── SuperAdmin Only Routes ────────────────────────────────────── */}
          <Route element={<RoleRoute allowedRoles={['SuperAdmin']}><Outlet /></RoleRoute>}>
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/staff" element={<AdminManagement />} />
          </Route>
        </Route>

        {/* ── 404 catch-all ──────────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
