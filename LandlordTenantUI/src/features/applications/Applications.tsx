import { useAuth } from '@/features/auth/AuthContext'
import { LandlordApplications } from './LandlordApplications'
import { TenantApplications } from './TenantApplications'

export default function Applications() {
  const { user } = useAuth()

  if (user?.role === 'Tenant') {
    return <TenantApplications />
  }

  return <LandlordApplications />
}
