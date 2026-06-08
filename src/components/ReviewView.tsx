import type { AppStore } from '../hooks/useAppStore'
import { computeTrends, getWeeklyHighlights } from '../utils/summary'
import { formatWeekLabel } from '../utils/week'
import { Delta } from './Delta'
import { WeekSelector } from './WeekSelector'

export function ReviewView({ store }: { store: AppStore }) {
  const {
    state,
    currentWeek,
    setCurrentWeek,
    weekData,
    plannedTotal,
    actualTotal,
    discretionaryHours,
  } = store

  const highlights = getWeeklyHighlights(state, currentWeek)
  const trends = computeTrends(state, currentWeek, 4)

  const rows = state.interests
    .map((interest) => {
      const planned = weekData.planned[interest.id] ?? 0
      const actual = weekData.actual[interest.id] ?? 0
      return {
        interest,
        planned,
        actual,
        delta: actual - planned,
        absDelta: Math.abs(actual - planned),
      }
    })
    .sort((a, b) => b.absDelta - a.absDelta)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium text-neutral-900">Review</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {formatWeekLabel(currentWeek)} — planned vs actual
        </p>
      </div>

      <WeekSelector
        weekStart={currentWeek}
        onChange={setCurrentWeek}
        label="Week"
      />

      {state.interests.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Add interests and log hours to see your weekly summary.
        </p>
      ) : (
        <>
          <section className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              This week
            </p>

            <div className="grid grid-cols-2 gap-4 font-mono text-sm tabular-nums">
              <div>
                <p className="text-xs text-neutral-400 mb-1">Planned</p>
                <p className="text-neutral-800">{plannedTotal}h</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Actual</p>
                <p className="text-neutral-800">{actualTotal}h</p>
              </div>
            </div>

            <p className="font-mono text-xs tabular-nums text-neutral-500">
              <Delta planned={plannedTotal} actual={actualTotal} /> vs plan ·{' '}
              {discretionaryHours}h discretionary
            </p>

            {(highlights.over || highlights.under) && (
              <div className="space-y-1 text-sm text-neutral-600">
                {highlights.over && (
                  <p>
                    Most over: {highlights.over.name} (+{highlights.over.delta}h)
                  </p>
                )}
                {highlights.under && (
                  <p>
                    Most under: {highlights.under.name} ({highlights.under.delta}h)
                  </p>
                )}
              </div>
            )}

            {weekData.notes && (
              <p className="text-sm text-neutral-500 border-l-2 border-neutral-200 pl-3">
                {weekData.notes}
              </p>
            )}

            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 gap-y-1 text-xs uppercase tracking-widest text-neutral-400 pt-2">
              <span>Interest</span>
              <span className="text-right">Plan</span>
              <span className="text-right">Actual</span>
              <span className="text-right">Delta</span>
            </div>

            <div className="space-y-3">
              {rows.map(({ interest, planned, actual }) => (
                <div
                  key={interest.id}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-6"
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
                  <span className="font-mono text-sm tabular-nums text-neutral-800 text-right">
                    {actual}h
                  </span>
                  <div className="text-right">
                    <Delta planned={planned} actual={actual} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-neutral-200 pt-6 space-y-4">
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              4-week trends
            </p>

            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-6 gap-y-1 text-xs uppercase tracking-widest text-neutral-400">
              <span>Interest</span>
              <span className="text-right">Avg plan</span>
              <span className="text-right">Avg actual</span>
              <span className="text-right">Avg Δ</span>
            </div>

            <div className="space-y-3">
              {trends.map((row) => (
                <div
                  key={row.interestId}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-6"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    <span className="truncate text-sm text-neutral-800">
                      {row.name}
                    </span>
                  </div>
                  <span className="font-mono text-sm tabular-nums text-neutral-400 text-right">
                    {row.avgPlanned}h
                  </span>
                  <span className="font-mono text-sm tabular-nums text-neutral-800 text-right">
                    {row.avgActual}h
                  </span>
                  <div className="text-right">
                    <Delta planned={row.avgPlanned} actual={row.avgActual} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
