import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { getUsers, suspendUser, reactivateUser } from './api'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(window.atob(base64))
  } catch {
    return null
  }
}

export function UserManagement() {
  const queryClient = useQueryClient()
  
  const [role, setRole] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(1)

  const [suspendModalUserId, setSuspendModalUserId] = useState<string | null>(null)
  const [suspendReason, setSuspendReason] = useState('')

  const token = localStorage.getItem('token')
  let currentUserId = ''
  if (token) {
    const payload = parseJwt(token)
    currentUserId = payload?.sub || payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || ''
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', { role, status, page }],
    queryFn: () => getUsers({ role: role || undefined, status: status || undefined, page })
  })

  const { mutate: doSuspend, isPending: isSuspending } = useMutation({
    mutationFn: (args: { id: string, reason: string }) => suspendUser(args.id, args.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setSuspendModalUserId(null)
      setSuspendReason('')
    }
  })

  const { mutate: doReactivate, isPending: isReactivating } = useMutation({
    mutationFn: (id: string) => reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-harbour-text">Users</h1>
        
        <div className="flex items-center gap-3">
          <select 
            value={role} 
            onChange={e => { setRole(e.target.value); setPage(1) }}
            className="border border-harbour-border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">All Roles</option>
            <option value="Tenant">Tenant</option>
            <option value="Landlord">Landlord</option>
            <option value="Admin">Admin</option>
          </select>

          <select 
            value={status} 
            onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="border border-harbour-border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-harbour-border/50">
          <div className="w-8 h-8 rounded-full border-4 border-harbour-border border-t-harbour-accent animate-spin" />
        </div>
      ) : isError ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-xl">Error loading users.</div>
      ) : !data || data.items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-harbour-border/50">
          <p className="text-harbour-text-secondary">No users found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {data.items.map((u) => {
            const isSelf = u.id === currentUserId
            return (
              <div key={u.id} className="bg-white rounded-xl p-4 shadow-sm border border-harbour-border/50 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar fallback={`${u.firstName[0] || ''}${u.lastName[0] || ''}`} src={u.avatarUrl} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-harbour-text truncate">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-harbour-text-secondary truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge label={u.role} variant="neutral" />
                  <Badge label={u.status} variant={u.status === 'Suspended' ? 'warning' : 'success'} />
                  <span className="text-xs text-harbour-text-tertiary ml-auto">
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Mobile Actions */}
                <div className="mt-2 border-t border-harbour-border pt-4">
                  {suspendModalUserId === u.id ? (
                    <div className="flex flex-col gap-3">
                      <textarea
                        className="w-full border border-harbour-border rounded-lg p-2 text-sm"
                        placeholder="Reason (optional, visible in admin logs only)"
                        value={suspendReason}
                        onChange={e => setSuspendReason(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setSuspendModalUserId(null)} className="flex-1">Cancel</Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => doSuspend({ id: u.id, reason: suspendReason })} 
                          isLoading={isSuspending}
                          className="flex-1 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        >
                          Confirm
                        </Button>
                      </div>
                    </div>
                  ) : u.status === 'Active' ? (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full text-red-600 hover:bg-red-50"
                      onClick={() => setSuspendModalUserId(u.id)}
                      disabled={isSelf}
                      title={isSelf ? "You cannot suspend your own account" : undefined}
                    >
                      <ShieldAlert size={16} className="mr-2" /> Suspend
                    </Button>
                  ) : (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full text-green-600 hover:bg-green-50"
                      onClick={() => {
                        if (window.confirm('Reactivate this account?')) {
                          doReactivate(u.id)
                        }
                      }}
                      isLoading={isReactivating}
                    >
                      <ShieldCheck size={16} className="mr-2" /> Reactivate
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Desktop Table */}
      {data && data.items.length > 0 && (
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-harbour-border/50 overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-harbour-surface border-b border-harbour-border">
              <tr>
                <th className="px-6 py-4 font-medium text-harbour-text-secondary">User</th>
                <th className="px-6 py-4 font-medium text-harbour-text-secondary">Role</th>
                <th className="px-6 py-4 font-medium text-harbour-text-secondary">Status</th>
                <th className="px-6 py-4 font-medium text-harbour-text-secondary">Joined</th>
                <th className="px-6 py-4 font-medium text-harbour-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-harbour-border">
              {data.items.map((u) => {
                const isSelf = u.id === currentUserId
                return (
                  <tr key={u.id} className="hover:bg-harbour-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar fallback={`${u.firstName[0] || ''}${u.lastName[0] || ''}`} src={u.avatarUrl} />
                        <div>
                          <p className="font-medium text-harbour-text">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-harbour-text-secondary">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge label={u.role} variant="neutral" />
                    </td>
                    <td className="px-6 py-4">
                      <Badge label={u.status} variant={u.status === 'Suspended' ? 'warning' : 'success'} />
                    </td>
                    <td className="px-6 py-4 text-harbour-text-secondary">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {suspendModalUserId === u.id ? (
                        <div className="flex flex-col gap-2 items-end min-w-[250px]">
                          <textarea
                            className="w-full border border-harbour-border rounded p-2 text-xs"
                            placeholder="Reason (optional, admin logs only)"
                            value={suspendReason}
                            onChange={e => setSuspendReason(e.target.value)}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setSuspendModalUserId(null)}>Cancel</Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => doSuspend({ id: u.id, reason: suspendReason })} 
                              isLoading={isSuspending}
                              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            >
                              Confirm suspend
                            </Button>
                          </div>
                        </div>
                      ) : u.status === 'Active' ? (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="text-red-600 hover:bg-red-50 border-transparent hover:border-red-200"
                          onClick={() => setSuspendModalUserId(u.id)}
                          disabled={isSelf}
                          title={isSelf ? "You cannot suspend your own account" : undefined}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="text-green-600 hover:bg-green-50 border-transparent hover:border-green-200"
                          onClick={() => {
                            if (window.confirm('Reactivate this account?')) {
                              doReactivate(u.id)
                            }
                          }}
                          isLoading={isReactivating}
                        >
                          Reactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-4 border-t border-harbour-border">
          <Button 
            variant="secondary" 
            size="sm" 
            disabled={!data.hasPreviousPage}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-harbour-text-secondary">
            Page {data.pageNumber} of {data.totalPages}
          </span>
          <Button 
            variant="secondary" 
            size="sm" 
            disabled={!data.hasNextPage}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
