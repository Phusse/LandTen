import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { LandlordDashboard } from './LandlordDashboard'
import { TenantDashboard } from './TenantDashboard'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const role = user?.role?.toLowerCase()
    if (role === 'admin' || role === 'superadmin') {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [user, navigate])

  if (user?.role === 'Tenant') {
    return <TenantDashboard />
  }

  return <LandlordDashboard />
}
