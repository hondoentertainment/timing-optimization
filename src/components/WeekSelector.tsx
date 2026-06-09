import { getWeekStart, shiftWeek } from '../utils/week'

interface WeekSelectorProps {
  weekStart: string
  onChange: (weekStart: string) => void
  onToday?: () => void
}

export function WeekSelector({ weekStart, onChange, onToday }: WeekSelectorProps) {
  const isCurrentWeek = weekStart === getWeekStart()

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--fill-secondary)] p-1">
        <button
          type="button"
          onClick={() => onChange(shiftWeek(weekStart, -1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--label-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--label)]"
          aria-label="Previous week"
        >
          ‹
        </button>
        <span className="min-w-[148px] px-2 text-center text-[15px] font-medium tabular-nums text-[var(--label)]">
          {formatWeekShort(weekStart)}
        </span>
        <button
          type="button"
          onClick={() => onChange(shiftWeek(weekStart, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--label-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--label)]"
          aria-label="Next week"
        >
          ›
        </button>
      </div>
      {onToday && !isCurrentWeek && (
        <button
          type="button"
          onClick={onToday}
          className="text-[15px] font-medium text-[var(--accent)] transition-opacity hover:opacity-80"
        >
          Today
        </button>
      )}
    </div>
  )
}

function formatWeekShort(weekStart: string): string {
  const start = new Date(weekStart + 'T12:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}
