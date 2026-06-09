import type { AppStore } from '../hooks/useAppStore'
import { formatWeekLabel } from '../utils/week'
import { Delta } from './Delta'
import { HourSlider } from './ui/HourSlider'
import { WeekSelector } from './WeekSelector'
import { Card } from './ui/Card'
import { PageHeader, SectionLabel } from './ui/PageHeader'

export function TrackView({ store }: { store: AppStore }) {
  const {
    state,
    currentWeek,
    setCurrentWeek,
    goToCurrentWeek,
    weekData,
    plannedTotal,
    actualTotal,
    discretionaryHours,
    setActual,
    setWeekNotes,
  } = store

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Track"
        subtitle={`${formatWeekLabel(currentWeek)} · log reality`}
        action={
          <WeekSelector
            weekStart={currentWeek}
            onChange={setCurrentWeek}
            onToday={goToCurrentWeek}
          />
        }
      />

      {state.interests.length === 0 ? (
        <Card className="p-6">
          <p className="text-[15px] text-[var(--label-secondary)]">
            Add interests first, then log your actual hours here.
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden divide-y divide-[var(--separator)]">
            {state.interests.map((interest) => {
              const planned = weekData.planned[interest.id] ?? 0
              const actual = weekData.actual[interest.id] ?? 0
              const goal = interest.goalHours ?? 0
              return (
                <div key={interest.id} className="px-4 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: interest.color }}
                      />
                      <span className="truncate text-[15px] font-medium text-[var(--label)]">
                        {interest.name}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-[13px] tabular-nums">
                      <span className="text-[var(--label-tertiary)]">plan {planned}h</span>
                      <Delta planned={planned} actual={actual} />
                      {goal > 0 && actual >= goal && (
                        <span className="text-[var(--success)]">✓ goal</span>
                      )}
                    </div>
                  </div>
                  <HourSlider
                    value={actual}
                    onChange={(h) => setActual(interest.id, h)}
                    max={discretionaryHours}
                    color={interest.color}
                  />
                </div>
              )
            })}
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between text-[15px]">
              <span className="font-medium text-[var(--label)]">Total</span>
              <div className="flex items-center gap-4 tabular-nums">
                <span className="text-[var(--label-secondary)]">{plannedTotal}h plan</span>
                <span className="font-semibold text-[var(--label)]">{actualTotal}h actual</span>
                <Delta planned={plannedTotal} actual={actualTotal} size="sm" />
              </div>
            </div>
            <p className="mt-2 text-[13px] text-[var(--label-secondary)]">
              of {discretionaryHours}h discretionary
            </p>
          </Card>
        </>
      )}

      <div>
        <SectionLabel>Week notes</SectionLabel>
        <Card className="mt-2 p-4">
          <textarea
            id="week-notes"
            value={weekData.notes ?? ''}
            onChange={(e) => setWeekNotes(e.target.value)}
            placeholder="Travel week, lower gym hours…"
            rows={3}
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-[var(--label)] outline-none placeholder:text-[var(--label-tertiary)]"
          />
        </Card>
      </div>
    </div>
  )
}
