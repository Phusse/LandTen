import { clsx } from 'clsx'

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={clsx('flex space-x-1 border-b border-harbour-border', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
              isActive
                ? 'border-harbour-primary text-harbour-primary'
                : 'border-transparent text-harbour-text-secondary hover:text-harbour-text hover:border-harbour-border'
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
