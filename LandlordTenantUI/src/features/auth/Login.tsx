import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, Zap } from 'lucide-react'
import { Button, Card, Input, PasswordInput } from '@/components/ui'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { useAuth } from './AuthContext'

interface LoginForm {
  email: string
  password: string
}

export default function Login() {
  const { login, loginAsDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: string })?.from ?? '/dashboard'
  const flash = (location.state as { flash?: string })?.flash

  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ mode: 'onTouched' })

  async function onSubmit({ email, password }: LoginForm) {
    setServerError(null)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch {
      setServerError('Invalid email or password. Try the demo access below.')
    }
  }

  function handleDemoLogin() {
    loginAsDemo()
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout>
      {/* ── Demo access card — shown prominently at the top ─────────────── */}
        <div className="mb-4 rounded-xl border-2 border-harbour-accent/40 bg-harbour-warning-bg px-5 py-4">
          <div className="flex items-start gap-3">
            <Zap size={18} className="mt-0.5 shrink-0 text-harbour-accent" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-harbour-text">
                Backend not running?
              </p>
              <p className="mt-0.5 text-xs text-harbour-text-secondary">
                Use demo access to explore the full UI with mock data — no server needed.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="mt-3 w-full"
            onClick={handleDemoLogin}
          >
            Enter as demo user (Tunde · Landlord)
          </Button>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-harbour-border" />
          <span className="text-xs text-harbour-text-tertiary">or sign in with your account</span>
          <div className="h-px flex-1 bg-harbour-border" />
        </div>

        {/* ── Real login card ─────────────────────────────────────────────── */}
        <Card className="px-8 py-8">
          <h1 className="font-display text-2xl font-semibold text-harbour-text">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-harbour-text-secondary">
            Sign in to your account to continue.
          </p>

          {flash && (
            <div className="mt-4 rounded-lg bg-harbour-success-bg px-4 py-3">
              <p className="text-sm text-harbour-success">{flash}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex flex-col gap-4"
            noValidate
          >
            <Input
              id="login-email"
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

            <PasswordInput
              id="login-password"
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />

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
              Log in
            </Button>
          </form>
        </Card>

        <p className="mt-5 text-center text-sm text-harbour-text-secondary">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-harbour-accent hover:text-harbour-accent-hover underline"
          >
            Create one
          </Link>
        </p>
      </AuthLayout>
  )
}
