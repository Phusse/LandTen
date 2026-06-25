import { useState } from 'react'
import { Card, Button, Badge, Avatar, Input } from '@/components/ui'
import { Search, Plus, ShieldAlert, UserX, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, suspendUser, reactivateUser, deleteUser, inviteAdmin } from './api'
import { useAuth } from '@/features/auth/AuthContext'
import toast from 'react-hot-toast'

export default function AdminManagement() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role?.toLowerCase() === 'superadmin'

  const [searchTerm, setSearchTerm] = useState('')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: () => getUsers(searchTerm),
  })

  const suspendMutation = useMutation({
    mutationFn: (id: string) => suspendUser(id, 'SuperAdmin revoked staff access'),
    onSuccess: () => {
      toast.success('Staff access revoked')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => reactivateUser(id, 'SuperAdmin restored staff access'),
    onSuccess: () => {
      toast.success('Staff access restored')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id, 'SuperAdmin deleted staff account'),
    onSuccess: () => {
      toast.success('Staff account deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }
  })

  const inviteMutation = useMutation({
    mutationFn: (payload: any) => inviteAdmin(payload),
    onSuccess: () => {
      toast.success('Admin invited successfully')
      setIsInviteModalOpen(false)
      setInviteForm({ firstName: '', lastName: '', email: '', password: '' })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to invite admin')
    }
  })

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    inviteMutation.mutate({
      firstName: inviteForm.firstName,
      lastName: inviteForm.lastName,
      email: inviteForm.email,
      temporaryPassword: inviteForm.password
    })
  }

  const allUsers = data?.items || []
  const admins = allUsers.filter((u: any) => u.role === 'Admin' || u.role === 'SuperAdmin')

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-harbour-text">Staff Management</h1>
          <p className="text-harbour-text-secondary mt-1">
            Manage admin access, assign roles, and revoke privileges.
          </p>
        </div>
        {isSuperAdmin && (
          <Button className="flex items-center gap-2" onClick={() => setIsInviteModalOpen(true)}>
            <Plus size={18} />
            Invite Admin
          </Button>
        )}
      </div>

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
                <th className="pb-3 pl-2">Staff Member</th>
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
                      <Loader2 className="animate-spin" size={16} /> Loading staff...
                    </div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-harbour-text-secondary">
                    No staff found.
                  </td>
                </tr>
              ) : (
                admins.map((admin: any) => (
                  <tr key={admin.id} className="group hover:bg-harbour-bg-subtle/50 transition-colors">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <Avatar initials={(admin.firstName?.[0] || '') + (admin.lastName?.[0] || '')} size="sm" />
                        <div>
                          <p className="font-medium text-harbour-text">{admin.firstName} {admin.lastName}</p>
                          <p className="text-sm text-harbour-text-tertiary">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge 
                        label={admin.role} 
                        variant={admin.role === 'SuperAdmin' ? 'warning' : 'neutral'} 
                      />
                    </td>
                    <td className="py-4">
                      <Badge 
                        label={admin.status} 
                        variant={admin.status === 'Active' ? 'success' : 'warning'} 
                      />
                    </td>
                    <td className="py-4 text-sm text-harbour-text-secondary">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 pr-2 text-right">
                      {admin.role !== 'SuperAdmin' && isSuperAdmin ? (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {admin.status === 'Active' ? (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="text-amber-600 border-amber-200 hover:bg-amber-50"
                              onClick={() => suspendMutation.mutate(admin.id)}
                              disabled={suspendMutation.isPending}
                            >
                              <ShieldAlert size={16} className="mr-1" /> Suspend
                            </Button>
                          ) : (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => reactivateMutation.mutate(admin.id)}
                              disabled={reactivateMutation.isPending}
                            >
                              <ShieldAlert size={16} className="mr-1" /> Reactivate
                            </Button>
                          )}
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to permanently delete this Admin?")) {
                                deleteMutation.mutate(admin.id)
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <UserX size={16} className="mr-1" /> Delete
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-harbour-text-tertiary mr-2">Immutable</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-display font-bold text-harbour-text mb-4">Invite New Admin</h2>
            <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-harbour-text mb-1">First Name</label>
                  <Input 
                    required 
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({...inviteForm, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-harbour-text mb-1">Last Name</label>
                  <Input 
                    required 
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({...inviteForm, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-harbour-text mb-1">Email Address</label>
                <Input 
                  type="email" 
                  required 
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-harbour-text mb-1">Temporary Password</label>
                <Input 
                  type="text" 
                  required 
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm({...inviteForm, password: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="secondary" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? 'Inviting...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
