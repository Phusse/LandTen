import { useNavigate } from 'react-router-dom'
import { Frown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-harbour-bg px-4 text-center">
      <div className="mb-8 flex justify-center">
        <Logo 
          markSize="h-20 w-20" 
          showWordmark={false} 
          fallbackBgClass="bg-harbour-surface" 
          fallbackIconClass="text-harbour-accent" 
          fallbackIconSize={28} 
        />
      </div>

      {/* 404 copy */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <Frown size={28} className="text-harbour-text-secondary" />
          <span className="font-display text-5xl font-semibold text-harbour-primary">
            404
          </span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-harbour-text">
          Page not found
        </h1>
        <p className="max-w-xs text-sm text-harbour-text-secondary">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button variant="primary" onClick={() => navigate('/dashboard', { replace: true })}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
