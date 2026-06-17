import { useAuth } from '@/features/auth/AuthContext'
import { LandlordDashboard } from './LandlordDashboard'
import { TenantDashboard } from './TenantDashboard'

export default function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'Tenant') {
    return <TenantDashboard />
  }

  return <LandlordDashboard />
}
