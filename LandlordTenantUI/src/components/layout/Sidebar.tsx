import { NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Home,
  Building,
  FileText,
  MessageSquare,
  ShieldCheck,
  LogOut,
  Settings,
  Search,
  Users,
  UserCog,
  LayoutDashboard,
} from 'lucide-react'
import { Avatar, Logo } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getMyProfile } from '@/features/settings/api'
import { getUnreadCount } from '@/features/messages/api'
import { queryKeys } from '@/lib/queryKeys'
export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchIntervalInBackground: true,
  })

  const { data: unreadCount = 0 } = useQuery({
    queryKey: queryKeys.conversations.unreadCount,
    queryFn: getUnreadCount,
    enabled: !!user,
    staleTime: 0,
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
  })

  const firstName = profile?.firstName || user?.firstName || ''
  const lastName = profile?.lastName || user?.lastName || ''

  const displayName = user
    ? `${firstName} ${lastName}`.trim() || user.email
    : '—'

  const initials = user
    ? `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?'
    : '?'

  const roleLabel = user?.role ?? ''
  const avatarUrl = profile?.avatarUrl || undefined

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const isLandlord = user?.role?.toLowerCase() === 'landlord'
  const isTenant = user?.role?.toLowerCase() === 'tenant'
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'superadmin'
  const isSuperAdmin = user?.role?.toLowerCase() === 'superadmin'

  const navItems = []

  if (isLandlord || isTenant) {
    navItems.push({ to: '/dashboard', label: 'Dashboard', Icon: Home })
    if (isTenant) navItems.push({ to: '/search', label: 'Search', Icon: Search })
    if (isLandlord) navItems.push({ to: '/properties', label: 'Properties', Icon: Building })
    navItems.push({ to: '/applications', label: 'Applications', Icon: FileText })
    navItems.push({ to: '/messages', label: 'Messages', Icon: MessageSquare })
    navItems.push({ to: '/verification', label: 'Verification', Icon: ShieldCheck })
  }

  if (isAdmin) {
    navItems.push({ to: '/admin/dashboard', label: 'Overview', Icon: LayoutDashboard })
    navItems.push({ to: '/admin/verifications', label: 'Verifications', Icon: ShieldCheck })
    navItems.push({ to: '/admin/properties', label: 'Properties', Icon: Building })
  }

  if (isSuperAdmin) {
    navItems.push({ to: '/admin/users', label: 'User Directory', Icon: Users })
    navItems.push({ to: '/admin/staff', label: 'Staff Management', Icon: UserCog })
  }

  navItems.push({ to: isAdmin ? '/admin/settings' : '/settings', label: 'Settings', Icon: Settings })

  return (
    <aside
      className="hidden lg:flex flex-col sticky top-0 h-screen shrink-0 bg-harbour-primary"
      style={{ width: 230 }}
    >
      {/* Logo mark */}
      <div className="px-5 pt-7 pb-8">
        <Logo variant="dark" />
      </div>

      {/* Nav list */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                'border-l-[3px]',
                isActive
                  ? 'border-harbour-accent bg-white/[0.08] text-white'
                  : 'border-transparent text-white/70 hover:bg-white/[0.06] hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative shrink-0">
                  <Icon
                    size={18}
                    className={clsx(
                      'transition-colors',
                      isActive
                        ? 'text-harbour-accent'
                        : 'text-white/60 group-hover:text-white/90',
                    )}
                  />
                  {label === 'Messages' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex min-w-[18px] items-center justify-center rounded-full bg-harbour-accent px-1 h-[18px] text-[10px] font-semibold text-white leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile block */}
      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar initials={initials} src={avatarUrl} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white leading-tight">
              {displayName}
            </p>
            <p className="truncate text-xs text-white/50 mt-0.5">{roleLabel}</p>
          </div>
          {/* Logout button */}
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="shrink-0 rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbour-accent"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
