import type { View } from '../types'

const NAV: { id: View; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'track', label: 'Track' },
  { id: 'review', label: 'Review' },
  { id: 'interests', label: 'Interests' },
  { id: 'settings', label: 'Settings' },
]

interface LayoutProps {
  view: View
  onViewChange: (view: View) => void
  children: React.ReactNode
}

export function Layout({ view, onViewChange, children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-8 py-5">
          <span className="text-sm font-medium tracking-tight text-neutral-900">
            168
          </span>
          <nav className="flex gap-6">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`text-sm ${
                  view === item.id
                    ? 'text-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-8 py-10">{children}</main>
    </div>
  )
}
