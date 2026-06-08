import type { AppStore } from '../hooks/useAppStore'
import { formatWeekLabel } from '../utils/week'
import { Delta } from './Delta'
import { HourInput } from './HourInput'
import { WeekSelector } from './WeekSelector'

export function TrackView({ store }: { store: AppStore }) {
  const {
    state,
    currentWeek,
    setCurrentWeek,
    weekData,
    plannedTotal,
    actualTotal,
    discretionaryHours,
    setActual,
    setWeekNotes,
  } = store

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium text-neutral-900">Track</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {formatWeekLabel(currentWeek)} — log what actually happened
        </p>
      </div>

      <WeekSelector
        weekStart={currentWeek}
        onChange={setCurrentWeek}
        label="Week"
      />

      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 gap-y-1 text-xs uppercase tracking-widest text-neutral-400">
        <span>Interest</span>
        <span className="text-right">Plan</span>
        <span className="text-right">Actual</span>
        <span className="text-right">Delta</span>
      </div>

      {state.interests.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Add interests first, then log your actual hours here.
        </p>
      ) : (
        <div className="space-y-4">
          {state.interests.map((interest) => {
            const planned = weekData.planned[interest.id] ?? 0
            const actual = weekData.actual[interest.id] ?? 0
            return (
              <div
                key={interest.id}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-6 gap-y-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: interest.color }}
                  />
                  <span className="truncate text-sm text-neutral-800">
                    {interest.name}
                  </span>
                </div>
                <span className="font-mono text-sm tabular-nums text-neutral-400 text-right">
                  {planned}h
                </span>
                <HourInput
                  value={actual}
                  onChange={(h) => setActual(interest.id, h)}
                />
                <div className="text-right">
                  <Delta planned={planned} actual={actual} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {state.interests.length > 0 && (
        <div className="border-t border-neutral-200 pt-4">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 font-mono text-sm tabular-nums text-neutral-600">
            <span>Total</span>
            <span className="text-right text-neutral-400">{plannedTotal}h</span>
            <span className="text-right">{actualTotal}h</span>
            <span className="text-right">
              <Delta planned={plannedTotal} actual={actualTotal} />
            </span>
          </div>
          <p className="mt-2 font-mono text-xs tabular-nums text-neutral-400">
            of {discretionaryHours}h discretionary
          </p>
        </div>
      )}

      <div className="border-t border-neutral-200 pt-6">
        <label htmlFor="week-notes" className="block text-xs uppercase tracking-widest text-neutral-400 mb-2">
          Week notes
        </label>
        <textarea
          id="week-notes"
          value={weekData.notes ?? ''}
          onChange={(e) => setWeekNotes(e.target.value)}
          placeholder="Travel week, lower gym hours…"
          rows={2}
          className="w-full resize-none border-b border-neutral-300 bg-transparent py-2 text-sm outline-none placeholder:text-neutral-300 focus:border-neutral-900"
        />
      </div>
    </div>
  )
}
