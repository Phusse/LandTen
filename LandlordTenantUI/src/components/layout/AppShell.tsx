import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-harbour-bg">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Scrollable content area */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <main className="w-full max-w-[1400px] flex-1 px-4 py-5 pb-24 lg:px-10 lg:py-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
