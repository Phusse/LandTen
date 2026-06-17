import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import { Button, Card, Input, PasswordInput, Select } from '@/components/ui'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { useAuth } from './AuthContext'
import type { RegisterPayload } from './api'

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  role: 'Tenant' | 'Landlord'
}

const roleOptions = [
  { value: 'Tenant', label: 'Tenant — I want to rent a property' },
  { value: 'Landlord', label: 'Landlord — I want to list properties' },
]

export default function Register() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    mode: 'onTouched',
    defaultValues: { role: 'Tenant' },
  })

  const password = watch('password')

  async function onSubmit(values: RegisterForm) {
    setServerError(null)
    const payload: RegisterPayload = {
      email: values.email,
      phone: values.phone,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      role: values.role,
    }
    try {
      const { verificationRequired } = await authRegister(payload)
      navigate('/login', {
        state: {
          flash: verificationRequired
            ? 'Account created — check your email to verify, then log in.'
            : 'Account created — you can now log in.',
        },
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setServerError(message)
    }
  }

  return (
    <AuthLayout>
      <Card className="px-8 py-8">
          <h1 className="font-display text-2xl font-semibold text-harbour-text">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-harbour-text-secondary">
            Join VGC and find or list properties with confidence.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex flex-col gap-4"
            noValidate
          >
            {/* First / Last name row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                id="reg-first-name"
                label="First name"
                placeholder="Tunde"
                autoComplete="given-name"
                error={errors.firstName?.message}
                {...register('firstName', { required: 'Required' })}
              />
              <Input
                id="reg-last-name"
                label="Last name"
                placeholder="Adeola"
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register('lastName', { required: 'Required' })}
              />
            </div>

            <Input
              id="reg-email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email',
                },
              })}
            />

            <Input
              id="reg-phone"
              label="Phone number"
              type="tel"
              autoComplete="tel"
              placeholder="+234 800 000 0000"
              error={errors.phone?.message}
              {...register('phone', { required: 'Phone number is required' })}
            />

            <Select
              id="reg-role"
              label="I am a…"
              options={roleOptions}
              error={errors.role?.message}
              {...register('role', { required: 'Please select a role' })}
            />

            <PasswordInput
              id="reg-password"
              label="Password"
              placeholder="Create a password"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />

            <PasswordInput
              id="reg-confirm-password"
              label="Confirm password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
            />

            {/* Server error */}
            {serverError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <AlertCircle size={15} className="shrink-0 text-red-600" />
                <p className="text-sm text-red-700">{serverError}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="mt-1 w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Create account
            </Button>
          </form>
        </Card>

        <p className="mt-5 text-center text-sm text-harbour-text-secondary">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-harbour-accent hover:text-harbour-accent-hover underline"
          >
            Log in
          </Link>
        </p>
    </AuthLayout>
  )
}
