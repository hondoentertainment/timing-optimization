import { useState } from 'react'
import { TOTAL_WEEKLY_HOURS } from '../types'
import type { AppStore } from '../hooks/useAppStore'
import { formatWeekLabel } from '../utils/week'
import { AddInterestPanel } from './AddInterestPanel'
import { ProgressBar } from './ProgressBar'
import { WeekSelector } from './WeekSelector'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { HourSlider } from './ui/HourSlider'
import { PageHeader, SectionLabel } from './ui/PageHeader'

export function PlanView({ store }: { store: AppStore }) {
  const {
    state,
    currentWeek,
    setCurrentWeek,
    goToCurrentWeek,
    discretionaryHours,
    weekData,
    plannedTotal,
    setPlanned,
    addInterest,
    duplicatePlanFromPreviousWeek,
    replanFromActuals,
    distributeRemaining,
  } = store

  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const remaining = discretionaryHours - plannedTotal
  const isBalanced = remaining === 0

  const segments = [
    { label: 'Sleep', hours: state.settings.sleepHours, color: '#B8C9E0' },
    { label: 'Work', hours: state.settings.workHours, color: '#D4C4A8' },
    ...state.interests.map((i) => ({
      label: i.name,
      hours: weekData.planned[i.id] ?? 0,
      color: i.color,
    })),
  ]
  if (remaining > 0) {
    segments.push({ label: 'Open', hours: remaining, color: 'var(--fill)' })
  }

  function notify(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Plan"
        subtitle={formatWeekLabel(currentWeek)}
        action={
          <WeekSelector
            weekStart={currentWeek}
            onChange={setCurrentWeek}
            onToday={goToCurrentWeek}
          />
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => notify(duplicatePlanFromPreviousWeek() ? 'Copied last week\'s plan' : 'No plan to copy')}>
          Copy last week
        </Button>
        <Button size="sm" onClick={() => notify(replanFromActuals('lastWeek') ? 'Plan set from last week\'s actuals' : 'No actuals to use')}>
          From last actuals
        </Button>
        <Button size="sm" onClick={() => notify(replanFromActuals('fourWeekAvg') ? 'Plan set from 4-week average' : 'Not enough history')}>
          From 4-wk average
        </Button>
        {remaining > 0 && state.interests.length > 0 && (
          <Button size="sm" onClick={distributeRemaining}>
            Split {remaining}h evenly
          </Button>
        )}
        {toast && <span className="text-[13px] text-[var(--label-secondary)]">{toast}</span>}
      </div>

      <Card className="p-5">
        <ProgressBar segments={segments} total={TOTAL_WEEKLY_HOURS} />
      </Card>

      <div>
        <SectionLabel>Fixed blocks</SectionLabel>
        <Card className="mt-2 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[15px] text-[var(--label)]">Sleep</span>
            <span className="text-[15px] font-medium tabular-nums text-[var(--label-secondary)]">
              {state.settings.sleepHours}h
            </span>
          </div>
          <div className="mx-4 h-px bg-[var(--separator)]" />
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[15px] text-[var(--label)]">Work</span>
            <span className="text-[15px] font-medium tabular-nums text-[var(--label-secondary)]">
              {state.settings.workHours}h
            </span>
          </div>
        </Card>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between px-1">
          <SectionLabel>Interests</SectionLabel>
          <span
            className={`text-[13px] font-medium tabular-nums ${
              isBalanced ? 'text-[var(--success)]' : 'text-[var(--label)]'
            }`}
          >
            {isBalanced
              ? 'Balanced'
              : remaining > 0
                ? `${remaining}h open`
                : `${Math.abs(remaining)}h over`}
          </span>
        </div>

        {state.interests.length === 0 ? (
          <Card className="p-5">
            <p className="mb-4 text-[15px] text-[var(--label-secondary)]">
              Add interests to allocate your {discretionaryHours} discretionary hours.
            </p>
            <AddInterestPanel existingNames={[]} onAdd={addInterest} autoFocus={false} />
          </Card>
        ) : (
          <Card className="overflow-hidden divide-y divide-[var(--separator)]">
            {state.interests.map((interest) => {
              const hours = weekData.planned[interest.id] ?? 0
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
                      {interest.goalHours ? (
                        <span className="text-[13px] text-[var(--label-tertiary)]">
                          goal {interest.goalHours}h
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <HourSlider
                    value={hours}
                    onChange={(h) => setPlanned(interest.id, h)}
                    max={discretionaryHours}
                    color={interest.color}
                  />
                </div>
              )
            })}
          </Card>
        )}

        {state.interests.length > 0 && (
          <div className="mt-3">
            {showAdd ? (
              <Card className="p-4">
                <AddInterestPanel
                  existingNames={state.interests.map((i) => i.name)}
                  onAdd={addInterest}
                  autoFocus
                  showSuggestions={false}
                />
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
              </Card>
            ) : (
              <Button variant="ghost" onClick={() => setShowAdd(true)}>
                + Add interest
              </Button>
            )}
          </div>
        )}

        <p className="mt-4 px-1 text-[13px] tabular-nums text-[var(--label-secondary)]">
          {plannedTotal} / {discretionaryHours}h discretionary
        </p>
      </div>
    </div>
  )
}
