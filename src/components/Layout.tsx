import type { View } from '../types'

const MAIN_NAV: { id: View; label: string; icon: string }[] = [
  { id: 'home', label: 'Overview', icon: '◉' },
  { id: 'plan', label: 'Plan', icon: '◎' },
  { id: 'track', label: 'Track', icon: '◑' },
  { id: 'review', label: 'Insights', icon: '◐' },
  { id: 'interests', label: 'Interests', icon: '◫' },
]

interface LayoutProps {
  view: View
  onViewChange: (view: View) => void
  children: React.ReactNode
}

export function Layout({ view, onViewChange, children }: LayoutProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-[var(--sidebar-width)] flex-col border-r border-[var(--separator)] bg-[var(--bg-elevated)]/80 backdrop-blur-xl">
        <div className="px-5 pt-8 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--accent)] text-[15px] font-semibold text-white shadow-sm">
              168
            </div>
            <div>
              <p className="text-[15px] font-semibold leading-tight text-[var(--label)]">
                Hours
              </p>
              <p className="text-[11px] text-[var(--label-secondary)]">
                Time Optimizer
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {MAIN_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] font-medium transition-all duration-200 ${
                view === item.id
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[var(--label-secondary)] hover:bg-[var(--fill-secondary)] hover:text-[var(--label)]'
              }`}
            >
              <span className="w-5 text-center text-[13px] opacity-70">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-[var(--separator)] p-3">
          <button
            type="button"
            onClick={() => onViewChange('settings')}
            className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] font-medium transition-all duration-200 ${
              view === 'settings'
                ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'text-[var(--label-secondary)] hover:bg-[var(--fill-secondary)] hover:text-[var(--label)]'
            }`}
          >
            <span className="w-5 text-center text-[13px] opacity-70">⚙</span>
            Settings
          </button>
        </div>
      </aside>

      <div className="ml-[var(--sidebar-width)] min-h-screen flex-1">
        <main className="mx-auto max-w-3xl px-10 py-10">{children}</main>
      </div>
    </div>
  )
}
