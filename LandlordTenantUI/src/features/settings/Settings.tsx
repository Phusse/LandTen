import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Avatar, Button, Card, Input, PasswordInput, Badge } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthContext'
import { getMyProfile, updateMyProfile, changePassword, uploadAvatar } from './api'

export default function Settings() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
  })

  // Photo
  const { mutate: doUploadAvatar, isPending: isUploading } = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
    },
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      doUploadAvatar(file)
    }
  }

  // Personal info
  const { register: registerInfo, handleSubmit: handleInfoSubmit, formState: { isSubmitting: isSavingInfo } } = useForm({
    values: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
    }
  })
  
  const [infoSuccess, setInfoSuccess] = useState(false)
  const { mutateAsync: doUpdateProfile } = useMutation({ mutationFn: updateMyProfile })

  const onSaveInfo = async (data: { firstName: string, lastName: string }) => {
    await doUpdateProfile(data)
    setInfoSuccess(true)
    setTimeout(() => setInfoSuccess(false), 3000)
    queryClient.invalidateQueries({ queryKey: ['my-profile'] })
  }

  // Password
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, watch, reset: resetPassword, formState: { errors: passwordErrors } } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
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
      setPasswordError(e.response?.data?.detail || e.response?.data?.message || 'Incorrect current password')
    }
  }

  if (isLoadingProfile || !profile) {
    return <div className="p-4 sm:p-8">Loading settings...</div>
  }

  const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase()

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-harbour-text mb-2">Settings</h1>
      
      {/* Profile photo */}
      <Card className="p-6">
        <h2 className="font-display font-semibold text-lg text-harbour-text mb-4">Profile photo</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar initials={initials} src={profile.avatarUrl || undefined} size="lg" className="h-20 w-20 text-xl" />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              Upload new photo
            </Button>
            <p className="text-xs text-harbour-text-tertiary">JPG or PNG, square images work best</p>
          </div>
        </div>
      </Card>

      {/* Personal information */}
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
          <p className="text-xs text-harbour-text-tertiary mt-[-8px]">Contact support to change your email or phone number</p>
          
          <div className="flex items-center gap-4 mt-2">
            <Button type="submit" isLoading={isSavingInfo} disabled={isSavingInfo}>
              Save changes
            </Button>
            {infoSuccess && <span className="text-sm text-green-600 font-medium">Profile updated!</span>}
          </div>
        </form>
      </Card>

      {/* Verification status */}
      <Card className="p-6">
        <h2 className="font-display font-semibold text-lg text-harbour-text mb-4">Verification status</h2>
        <div className="flex items-center gap-4">
          <Badge 
            label={profile.verificationStatus} 
            variant={
              profile.verificationStatus === 'Verified' ? 'success' : 
              (profile.verificationStatus === 'Pending' ? 'warning' : 'neutral')
            } 
          />
          
          {profile.verificationStatus === 'Verified' ? (
            <span className="text-sm text-harbour-text-secondary">Your account is verified.</span>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/verification')}>
              Go to verification
            </Button>
          )}
        </div>
      </Card>

      {/* Change password */}
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
              validate: (val) => {
                if (watch('newPassword') != val) {
                  return "Your passwords do not match";
                }
              }
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

      {/* Account */}
      <Card className="p-6">
        <h2 className="font-display font-semibold text-lg text-harbour-text mb-4">Account</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-harbour-text-secondary">
            Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
          <Button variant="secondary" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={logout}>
            Log out
          </Button>
        </div>
      </Card>
    </div>
  )
}
