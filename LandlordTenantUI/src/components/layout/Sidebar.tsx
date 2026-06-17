import { NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Home,
  Building2,
  FileText,
  MessageCircle,
  ShieldCheck,
  LogOut,
  Settings,
} from 'lucide-react'
import { Avatar, Logo } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthContext'

import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMyProfile } from '@/features/settings/api'

const landlordNavItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: Home },
  { to: '/properties', label: 'Properties', Icon: Building2 },
  { to: '/applications', label: 'Applications', Icon: FileText },
  { to: '/messages', label: 'Messages', Icon: MessageCircle },
  { to: '/verification', label: 'Verification', Icon: ShieldCheck },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

const tenantNavItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: Home },
  { to: '/search', label: 'Search', Icon: Search },
  { to: '/applications', label: 'My Applications', Icon: FileText },
  { to: '/messages', label: 'Messages', Icon: MessageCircle },
  { to: '/verification', label: 'Verification', Icon: ShieldCheck },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
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

  const navItems = user?.role === 'Tenant' ? tenantNavItems : landlordNavItems

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
                <Icon
                  size={18}
                  className={clsx(
                    'shrink-0 transition-colors',
                    isActive
                      ? 'text-harbour-accent'
                      : 'text-white/60 group-hover:text-white/90',
                  )}
                />
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
