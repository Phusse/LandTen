import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { useAuth } from './AuthContext'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/kyc')
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else if (err.message && !err.message.includes('status code')) {
        setError(err.message)
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-harbour-bg p-4">
      <Card className="w-full max-w-sm bg-harbour-surface">
        <CardHeader className="text-center pt-8 pb-4">
          <h1 className="font-display text-2xl font-semibold text-harbour-primary">Admin sign in</h1>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium text-harbour-text">Email</label>
              <input
                type="email"
                required
                className="w-full rounded-md border border-harbour-border px-3 py-2 outline-none focus:border-harbour-accent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-harbour-text">Password</label>
              <input
                type="password"
                required
                className="w-full rounded-md border border-harbour-border px-3 py-2 outline-none focus:border-harbour-accent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
              Log in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
