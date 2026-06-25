import { Card } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getUsers, getPropertyVerifications, getKycVerifications } from './api'
import { motion } from 'framer-motion'
import { Users, Home, ShieldCheck, Activity, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

function StatCard({ title, value, change, trend, icon: Icon, isSuperAdmin }: any) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSuperAdmin ? 'bg-harbour-accent/10 text-harbour-accent' : 'bg-blue-50 text-blue-600'}`}>
              <Icon size={20} />
            </div>
            <h3 className="font-medium text-harbour-text-secondary">{title}</h3>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-display font-bold text-harbour-text">{value}</p>
          <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {change}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function AnalyticsDashboard() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role?.toLowerCase() === 'superadmin'

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-analytics-users'],
    queryFn: () => getUsers(''),
  })

  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ['admin-analytics-properties'],
    queryFn: () => getPropertyVerifications('Approved'),
  })

  const { data: pendingKycData, isLoading: kycLoading } = useQuery({
    queryKey: ['admin-analytics-kyc-pending'],
    queryFn: () => getKycVerifications('Pending'),
  })

  // Recent activity: combine latest KYC + property submissions
  const { data: recentKyc } = useQuery({
    queryKey: ['admin-analytics-kyc-all'],
    queryFn: () => getKycVerifications(''),
    enabled: isSuperAdmin,
  })

  const { data: allPropertiesData } = useQuery({
    queryKey: ['admin-analytics-all-properties'],
    queryFn: () => getPropertyVerifications(''),
    enabled: isSuperAdmin,
  })

  const totalUsers = usersData?.totalCount ?? 0
  const activeProperties = Array.isArray(propertiesData) ? propertiesData.length : 0
  const pendingKyc = Array.isArray(pendingKycData) ? pendingKycData.length : 0

  const isLoading = usersLoading || propertiesLoading || kycLoading

  // Build a combined recent activity feed from real data
  const recentActivity = isSuperAdmin
    ? [
        ...(Array.isArray(recentKyc) ? recentKyc.slice(0, 5).map((k: any) => ({
          id: k.id,
          action: `KYC ${k.status?.toLowerCase() || 'submitted'}: ${k.userEmail || 'unknown'}`,
          time: k.createdAt,
          type: k.status === 'Approved' ? 'success' : k.status === 'Rejected' ? 'warning' : 'neutral',
        })) : []),
        ...(Array.isArray(allPropertiesData) ? allPropertiesData.slice(0, 3).map((p: any) => ({
          id: p.propertyId,
          action: `Property listing: ${p.title || 'Untitled'}`,
          time: p.createdAt,
          type: p.status === 'Approved' ? 'success' : p.status === 'Rejected' ? 'warning' : 'neutral',
        })) : []),
      ]
        .filter((a) => a.time && a.time !== '0001-01-01T00:00:00Z')
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 8)
    : []

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-harbour-text">
          {isSuperAdmin ? 'SuperAdmin Overview' : 'Admin Operations Center'}
        </h1>
        <p className="text-harbour-text-secondary mt-1">
          {isSuperAdmin
            ? 'Global platform analytics and high-level performance metrics.'
            : 'Track your daily verification and moderation metrics.'}
        </p>
      </div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard
          title="Total Users"
          value={isLoading ? '...' : totalUsers.toLocaleString()}
          change="Real-time"
          trend="up"
          icon={Users}
          isSuperAdmin={isSuperAdmin}
        />
        <StatCard
          title="Active Properties"
          value={isLoading ? '...' : activeProperties.toLocaleString()}
          change="Real-time"
          trend="up"
          icon={Home}
          isSuperAdmin={isSuperAdmin}
        />
        <StatCard
          title="Pending KYC"
          value={isLoading ? '...' : pendingKyc.toLocaleString()}
          change="Real-time"
          trend={pendingKyc > 0 ? 'down' : 'up'}
          icon={ShieldCheck}
          isSuperAdmin={isSuperAdmin}
        />
        <StatCard
          title="Platform Health"
          value="99.9%"
          change="Operational"
          trend="up"
          icon={Activity}
          isSuperAdmin={isSuperAdmin}
        />
      </motion.div>

      {/* Extended Analytics for SuperAdmin */}
      {isSuperAdmin && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Summary Breakdown */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-display font-semibold text-lg text-harbour-text mb-4">Platform Snapshot</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Registered Users', value: totalUsers, color: 'text-harbour-accent' },
                { label: 'Verified Properties', value: activeProperties, color: 'text-green-600' },
                { label: 'Pending KYC Reviews', value: pendingKyc, color: 'text-amber-600' },
                {
                  label: 'Admin Staff',
                  value: Array.isArray(usersData?.items)
                    ? usersData!.items.filter((u: any) => u.role === 'Admin' || u.role === 'SuperAdmin').length
                    : '—',
                  color: 'text-purple-600',
                },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1 p-4 rounded-lg bg-harbour-bg-subtle">
                  <span className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</span>
                  <span className="text-sm text-harbour-text-secondary">{stat.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Real Recent Activity */}
          <Card className="p-6">
            <h3 className="font-display font-semibold text-lg text-harbour-text mb-4">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-harbour-text-tertiary gap-2">
                <Clock size={28} className="opacity-40" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[280px] pr-1">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-amber-500' : 'bg-gray-300'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-harbour-text truncate">{activity.action}</p>
                      <p className="text-xs text-harbour-text-tertiary">{timeAgo(activity.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  )
}
