import { Avatar, Button, Card } from '@/components/ui'

export interface MockApplication {
  id: string
  name: string
  initials: string
  meta: string
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

      {/* Actions */}
      <div className="flex shrink-0 gap-2">
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
      </div>
    </Card>
  )
}
