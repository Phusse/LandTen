import { Avatar, Button, Card } from '@/components/ui'

export interface MockApplication {
  id: string
  name: string
  initials: string
  meta: string
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn'
}

interface ApplicationRowProps {
  application: MockApplication
  onAccept?: (id: string) => void
  onDecline?: (id: string) => void
}

export function ApplicationRow({
  application,
  onAccept,
  onDecline,
}: ApplicationRowProps) {
  return (
    <Card className="flex items-center gap-4 px-5 py-4">
      {/* Avatar */}
      <Avatar initials={application.initials} size="md" className="shrink-0" />

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-harbour-text">
          {application.name}
        </p>
        <p className="mt-0.5 truncate text-sm text-harbour-text-secondary">
          {application.meta}
        </p>
      </div>

      {/* Actions / Status */}
      <div className="flex shrink-0 items-center gap-2">
        {application.status === 'Pending' ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDecline?.(application.id)}
            >
              Decline
            </Button>
            <Button
              variant="outline-accent"
              size="sm"
              onClick={() => onAccept?.(application.id)}
            >
              Accept
            </Button>
          </>
        ) : (
          <div className="flex items-center">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                application.status === 'Accepted'
                  ? 'bg-green-100 text-green-700'
                  : application.status === 'Rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {application.status}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
