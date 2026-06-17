import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Home,
  Building2,
  FileText,
  MessageCircle,
  ShieldCheck,
  Settings,
} from 'lucide-react'

import { Search } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'

const landlordNavItems = [
  { to: '/dashboard',    label: 'Dashboard',    Icon: Home },
  { to: '/properties',   label: 'Properties',   Icon: Building2 },
  { to: '/applications', label: 'Applications', Icon: FileText },
  { to: '/messages',     label: 'Messages',     Icon: MessageCircle },
  { to: '/verification', label: 'Verification', Icon: ShieldCheck },
  { to: '/settings',     label: 'Settings',     Icon: Settings },
]

const tenantNavItems = [
  { to: '/dashboard',    label: 'Dashboard',    Icon: Home },
  { to: '/search',       label: 'Search',       Icon: Search },
  { to: '/applications', label: 'Applications', Icon: FileText },
  { to: '/messages',     label: 'Messages',     Icon: MessageCircle },
  { to: '/verification', label: 'Verification', Icon: ShieldCheck },
  { to: '/settings',     label: 'Settings',     Icon: Settings },
]

export function BottomNav() {
  const { user } = useAuth()
  const navItems = user?.role === 'Tenant' ? tenantNavItems : landlordNavItems

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
              <Icon
                size={20}
                className={clsx(
                  'shrink-0 transition-colors',
                  isActive ? 'text-harbour-accent' : 'text-white/60',
                )}
              />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
