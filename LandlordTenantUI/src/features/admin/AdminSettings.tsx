import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Avatar, Button, Card, Input, PasswordInput, Badge } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthContext'
import { getMyProfile, updateMyProfile, changePassword } from '@/features/settings/api'
import { LogOut, User, Shield, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'session'>('session')
  const [confirmLogout, setConfirmLogout] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
  })

  // Personal info
  const { register: registerInfo, handleSubmit: handleInfoSubmit, formState: { isSubmitting: isSavingInfo } } = useForm({
    values: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
    }
  })
  const [infoSuccess, setInfoSuccess] = useState(false)
  const { mutateAsync: doUpdateProfile } = useMutation({ mutationFn: updateMyProfile })
  const onSaveInfo = async (data: { firstName: string; lastName: string }) => {
    await doUpdateProfile(data)
    setInfoSuccess(true)
    setTimeout(() => setInfoSuccess(false), 3000)
    queryClient.invalidateQueries({ queryKey: ['my-profile'] })
  }

  // Password
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, watch, reset: resetPassword, formState: { errors: passwordErrors } } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  })
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const { mutateAsync: doChangePassword, isPending: isChangingPassword } = useMutation({ mutationFn: changePassword })
  const onSavePassword = async (data: any) => {
    try {
      setPasswordError(null)
      await doChangePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })
      setPasswordSuccess(true)
      resetPassword()
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (e: any) {
      setPasswordError(e.response?.data?.detail || 'Incorrect current password')
    }
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  if (isLoading || !profile) {
    return <div className="p-8 text-harbour-text-secondary">Loading...</div>
  }

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || '?'
  const tabs = [
    { id: 'session', label: 'Session & Logout', Icon: LogOut },
    { id: 'profile', label: 'Profile', Icon: User },
    { id: 'security', label: 'Security', Icon: Shield },
  ] as const

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
      {/* Sidebar Nav */}
      <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-8">
        <h1 className="font-display text-2xl font-bold text-harbour-text mb-6">Settings</h1>

        {/* Admin profile card */}
        <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-harbour-bg-subtle">
          <Avatar initials={initials} src={profile.avatarUrl || undefined} size="md" />
          <div className="min-w-0">
            <p className="font-medium text-harbour-text text-sm truncate">{profile.firstName} {profile.lastName}</p>
            <p className="text-xs text-harbour-text-secondary truncate">{user?.role}</p>
          </div>
        </div>

        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 whitespace-nowrap px-3 py-2.5 text-left text-sm font-medium rounded-lg transition-colors w-full ${
                activeTab === id
                  ? 'bg-harbour-bg-subtle text-harbour-text'
                  : 'text-harbour-text-secondary hover:text-harbour-text hover:bg-harbour-bg-subtle/50'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col gap-6">

        {/* SESSION & LOGOUT TAB — shown first and prominently */}
        {activeTab === 'session' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="p-6">
              <h2 className="font-display font-semibold text-lg text-harbour-text mb-1">Session</h2>
              <p className="text-sm text-harbour-text-secondary mb-6">Manage your current admin session.</p>

              {/* Session info */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-harbour-bg-subtle">
                  <div>
                    <p className="font-medium text-sm text-harbour-text">Signed in as</p>
                    <p className="text-sm text-harbour-text-secondary mt-0.5">{profile.email}</p>
                  </div>
                  <Badge label={user?.role || 'Admin'} variant="success" />
                </div>
              </div>

              {/* Logout section */}
              <div className="rounded-xl border border-red-200 bg-red-50/60 p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-red-100">
                    <LogOut size={18} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-900 text-sm">Sign out of Admin Portal</h3>
                    <p className="text-sm text-red-700/80 mt-0.5">
                      You will be returned to the login page. Any unsaved changes will be lost.
                    </p>
                  </div>
                </div>

                {!confirmLogout ? (
                  <Button
                    variant="secondary"
                    className="text-red-600 border-red-300 hover:bg-red-100 hover:border-red-400 font-semibold"
                    onClick={() => setConfirmLogout(true)}
                  >
                    <LogOut size={15} className="mr-2" />
                    Log out
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm text-red-700 font-medium">
                      <AlertTriangle size={15} />
                      Are you sure you want to log out?
                    </div>
                    <div className="flex gap-3">
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white border-0"
                        onClick={handleLogout}
                      >
                        Yes, log me out
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setConfirmLogout(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="p-6">
              <h2 className="font-display font-semibold text-lg text-harbour-text mb-4">Personal information</h2>
              <form onSubmit={handleInfoSubmit(onSaveInfo)} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="First name" {...registerInfo('firstName', { required: true })} />
                  <Input label="Last name" {...registerInfo('lastName', { required: true })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Email" value={profile.email} disabled />
                  <Input label="Phone" value={profile.phone} disabled />
                </div>
                <p className="text-xs text-harbour-text-tertiary">Contact support to change your email or phone number</p>
                <div className="flex items-center gap-4 mt-2">
                  <Button type="submit" isLoading={isSavingInfo} disabled={isSavingInfo}>
                    Save changes
                  </Button>
                  {infoSuccess && <span className="text-sm text-green-600 font-medium">Profile updated!</span>}
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="p-6">
              <h2 className="font-display font-semibold text-lg text-harbour-text mb-4">Change password</h2>
              <form onSubmit={handlePasswordSubmit(onSavePassword)} className="flex flex-col gap-4">
                <PasswordInput
                  label="Current password"
                  placeholder="Enter current password"
                  error={passwordError || undefined}
                  {...registerPassword('currentPassword', { required: 'Required' })}
                />
                <PasswordInput
                  label="New password"
                  placeholder="Enter new password"
                  {...registerPassword('newPassword', { required: 'Required', minLength: 8 })}
                />
                <PasswordInput
                  label="Confirm new password"
                  placeholder="Confirm new password"
                  error={passwordErrors.confirmPassword?.message}
                  {...registerPassword('confirmPassword', {
                    required: 'Required',
                    validate: (val) => watch('newPassword') !== val ? 'Passwords do not match' : undefined
                  })}
                />
                <div className="flex items-center gap-4 mt-2">
                  <Button type="submit" isLoading={isChangingPassword} disabled={isChangingPassword}>
                    Update password
                  </Button>
                  {passwordSuccess && <span className="text-sm text-green-600 font-medium">Password updated!</span>}
                </div>
              </form>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}
