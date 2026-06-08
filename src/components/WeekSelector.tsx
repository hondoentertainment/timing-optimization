import { shiftWeek } from '../utils/week'

interface WeekSelectorProps {
  weekStart: string
  onChange: (weekStart: string) => void
  label: string
}

export function WeekSelector({ weekStart, onChange, label }: WeekSelectorProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-widest text-neutral-400">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(shiftWeek(weekStart, -1))}
          className="px-2 py-1 text-sm text-neutral-500 hover:text-neutral-900"
          aria-label="Previous week"
        >
          ←
        </button>
        <span className="font-mono text-sm tabular-nums text-neutral-700 min-w-[140px] text-center">
          {weekStart}
        </span>
        <button
          type="button"
          onClick={() => onChange(shiftWeek(weekStart, 1))}
          className="px-2 py-1 text-sm text-neutral-500 hover:text-neutral-900"
          aria-label="Next week"
        >
          →
        </button>
      </div>
    </div>
  )
}
