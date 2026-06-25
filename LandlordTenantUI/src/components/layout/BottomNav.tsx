import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Home,
  Building,
  FileText,
  MessageSquare,
  ShieldCheck,
  Settings,
  LayoutDashboard,
  Users,
  Search,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getUnreadCount } from '@/features/messages/api'
import { queryKeys } from '@/lib/queryKeys'

export function BottomNav() {
  const { user } = useAuth()

  const isLandlord = user?.role === 'Landlord'
  const isTenant = user?.role === 'Tenant'
  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin'
  const isSuperAdmin = user?.role === 'SuperAdmin'

  const navItems = []

  if (isLandlord || isTenant) {
    navItems.push({ to: '/dashboard', label: 'Dashboard', Icon: Home })
    if (isTenant) navItems.push({ to: '/search', label: 'Search', Icon: Search })
    if (isLandlord) navItems.push({ to: '/properties', label: 'Properties', Icon: Building })
    navItems.push({ to: '/applications', label: 'Apps', Icon: FileText })
    navItems.push({ to: '/messages', label: 'Msgs', Icon: MessageSquare })
  }

  if (isAdmin) {
    navItems.push({ to: '/admin/dashboard', label: 'Overview', Icon: LayoutDashboard })
    navItems.push({ to: '/admin/verifications', label: 'Verify', Icon: ShieldCheck })
    navItems.push({ to: '/admin/properties', label: 'Props', Icon: Building })
  }

  if (isSuperAdmin) {
    navItems.push({ to: '/admin/users', label: 'Users', Icon: Users })
  }

  navItems.push({ to: isAdmin ? '/admin/settings' : '/settings', label: 'Settings', Icon: Settings })

  const { data: unreadCount = 0 } = useQuery({
    queryKey: queryKeys.conversations.unreadCount,
    queryFn: getUnreadCount,
    enabled: !!user,
    staleTime: 0,
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
  })

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch justify-around bg-harbour-primary lg:hidden">
      {navItems.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              'flex flex-1 flex-col items-center justify-center gap-1 pt-1 text-[11px] font-medium transition-colors duration-150',
              'border-t-[3px]',
              isActive
                ? 'border-harbour-accent text-white'
                : 'border-transparent text-white/55 hover:text-white',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative shrink-0">
                <Icon
                  size={20}
                  className={clsx(
                    'shrink-0 transition-colors',
                    isActive ? 'text-harbour-accent' : 'text-white/60',
                  )}
                />
                {label === 'Messages' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex min-w-[18px] items-center justify-center rounded-full bg-harbour-accent px-1 h-[18px] text-[10px] font-semibold text-white leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
