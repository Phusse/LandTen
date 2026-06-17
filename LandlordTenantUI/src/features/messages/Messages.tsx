import { useState } from 'react'
import { clsx } from 'clsx'

export default function Messages() {
  const [showThread] = useState(false) // mobile state

  const conversations: any[] = []

  return (
    // Negative margin to stretch full height under AppShell max-w container
    <div className="-mx-4 -my-5 flex h-[calc(100svh)] overflow-hidden md:-mx-10 md:-my-8">

      {/* ── Conversation list ──────────────────────────────────────────────── */}
      <div
        className={clsx(
          'flex flex-col border-r border-harbour-border bg-harbour-surface',
          // Below md: full width unless thread is open
          showThread ? 'hidden md:flex' : 'flex w-full',
          'md:flex md:w-[280px] md:shrink-0',
        )}
      >
        <div className="shrink-0 border-b border-harbour-border px-5 py-4">
          <h1 className="font-display text-xl font-semibold text-harbour-text">
            Messages
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-harbour-border flex flex-col items-center justify-center p-4 text-center">
          {conversations.length === 0 && (
             <p className="text-sm text-harbour-text-secondary">No messages yet.</p>
          )}
        </div>
      </div>

      {/* ── Thread panel ──────────────────────────────────────────────────── */}
      <div
        className={clsx(
          'flex flex-1 flex-col bg-harbour-bg',
          // Below md: only show when thread is selected
          showThread ? 'flex w-full' : 'hidden',
          'md:flex',
        )}
      >
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-harbour-text-tertiary">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    </div>
  )
}
