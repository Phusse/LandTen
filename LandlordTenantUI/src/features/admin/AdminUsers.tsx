import { useState } from 'react'
import { Card, Button, Badge, Avatar, Input } from '@/components/ui'
import { Search, ShieldAlert, UserX, UserCheck, Loader2, ClipboardList, AlertTriangle, Users2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, suspendUser, reactivateUser, deleteUser, getAuditLog } from './api'
import toast from 'react-hot-toast'

interface SuspendTarget {
  id: string
  name: string
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [suspendTarget, setSuspendTarget] = useState<SuspendTarget | null>(null)
  const [suspendReason, setSuspendReason] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: () => getUsers(searchTerm),
  })

  const { data: auditLog = [], isLoading: auditLoading } = useQuery({
    queryKey: ['admin-audit-log'],
    queryFn: () => getAuditLog(50),
    staleTime: 30_000,
  })

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      suspendUser(id, reason),
    onSuccess: () => {
      toast.success('User suspended')
      setSuspendTarget(null)
      setSuspendReason('')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to suspend user'),
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => reactivateUser(id, 'Account reactivated by admin'),
    onSuccess: () => {
      toast.success('User reactivated')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to reactivate'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id, 'Account removed by admin'),
    onSuccess: () => {
      toast.success('User deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed to delete user'),
  })

  const users = data?.items || []

  function handleSuspendClick(id: string, name: string) {
    setSuspendTarget({ id, name })
    setSuspendReason('')
  }

  function handleConfirmSuspend() {
    if (!suspendTarget) return
    suspendMutation.mutate({ id: suspendTarget.id, reason: suspendReason.trim() || 'No reason provided' })
  }

  const actionColor = (action: string) => {
    switch (action) {
      case 'Suspend': return 'text-amber-700 bg-amber-50 border-amber-200'
      case 'Delete': return 'text-red-700 bg-red-50 border-red-200'
      case 'Reactivate': return 'text-green-700 bg-green-50 border-green-200'
      default: return 'text-blue-700 bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto flex flex-col gap-6">

      {/* ── Suspend Reason Modal ───────────────────────────────────────── */}
      {suspendTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSuspendTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-harbour-text">Suspend User</h2>
                <p className="text-sm text-harbour-text-secondary">
                  You are suspending <span className="font-semibold">{suspendTarget.name}</span>
                </p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-harbour-text mb-1.5">
                Reason for suspension <span className="text-harbour-text-tertiary">(required)</span>
              </label>
              <textarea
                className="w-full rounded-lg border border-harbour-border px-3 py-2.5 text-sm text-harbour-text placeholder:text-harbour-text-tertiary focus:outline-none focus:ring-2 focus:ring-harbour-accent resize-none"
                rows={3}
                placeholder="e.g. Violated platform terms of service..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSuspendTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-amber-500 hover:bg-amber-600 border-amber-500 hover:border-amber-600"
                onClick={handleConfirmSuspend}
                disabled={suspendMutation.isPending || !suspendReason.trim()}
                isLoading={suspendMutation.isPending}
              >
                Confirm Suspend
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-2xl font-bold text-harbour-text">User Directory</h1>
        <p className="text-harbour-text-secondary mt-1">Manage all user accounts across the platform.</p>
      </div>

      {/* ── User Table ─────────────────────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-harbour-text-tertiary" size={18} />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-harbour-border text-sm font-medium text-harbour-text-secondary">
                <th className="pb-3 pl-2">User</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Joined</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-harbour-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-harbour-text-secondary">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin" size={16} /> Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-harbour-text-tertiary">
                      <Users2 size={32} className="opacity-40" />
                      <p className="text-sm">No users found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="group hover:bg-harbour-bg-subtle/50 transition-colors">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <Avatar initials={(user.firstName?.[0] || '') + (user.lastName?.[0] || '')} size="sm" />
                        <div>
                          <p className="font-medium text-harbour-text">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-harbour-text-tertiary">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-harbour-text-secondary">{user.role}</span>
                    </td>
                    <td className="py-4">
                      <Badge
                        label={user.status}
                        variant={user.status === 'Active' ? 'success' : user.status === 'Suspended' ? 'warning' : 'neutral'}
                      />
                    </td>
                    <td className="py-4 text-sm text-harbour-text-secondary">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 pr-2 text-right">
                      {user.role === 'SuperAdmin' ? (
                        <span className="text-xs text-harbour-text-tertiary mr-2 italic">Protected</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {user.status === 'Active' ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={() => handleSuspendClick(user.id, `${user.firstName} ${user.lastName}`.trim() || user.email)}
                              disabled={suspendMutation.isPending}
                            >
                              <ShieldAlert size={16} className="mr-1" /> Suspend
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => reactivateMutation.mutate(user.id)}
                              disabled={reactivateMutation.isPending}
                            >
                              <UserCheck size={16} className="mr-1" /> Activate
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => {
                              if (window.confirm(`Permanently delete ${user.firstName || user.email}? This cannot be undone.`)) {
                                deleteMutation.mutate(user.id)
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <UserX size={16} className="mr-1" /> Delete
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Audit Log ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList size={18} className="text-harbour-text-secondary" />
          <h2 className="font-display text-lg font-semibold text-harbour-text">Admin Action Audit Log</h2>
        </div>
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-harbour-border bg-harbour-bg-subtle text-xs font-medium text-harbour-text-secondary uppercase tracking-wide">
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target User</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Performed By</th>
                  <th className="px-4 py-3">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-harbour-border">
                {auditLoading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-harbour-text-secondary">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="animate-spin" size={14} /> Loading audit log...
                      </div>
                    </td>
                  </tr>
                ) : auditLog.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-harbour-text-tertiary text-xs">
                      No admin actions recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLog.map((entry) => (
                    <tr key={entry.id} className="hover:bg-harbour-bg-subtle/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${actionColor(entry.action)}`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-harbour-text">{entry.targetName}</p>
                        <p className="text-harbour-text-tertiary text-xs">{entry.targetEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-harbour-text-secondary max-w-[240px]">
                        {entry.reason || <span className="italic text-harbour-text-tertiary">No reason given</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-harbour-text-tertiary">
                          {entry.performedBy.slice(0, 8)}…
                        </span>
                      </td>
                      <td className="px-4 py-3 text-harbour-text-secondary whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
