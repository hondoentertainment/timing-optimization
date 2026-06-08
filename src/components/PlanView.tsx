import { useState } from 'react'
import { TOTAL_WEEKLY_HOURS } from '../types'
import type { AppStore } from '../hooks/useAppStore'
import { formatWeekLabel } from '../utils/week'
import { AddInterestPanel } from './AddInterestPanel'
import { HourInput } from './HourInput'
import { ProgressBar } from './ProgressBar'
import { WeekSelector } from './WeekSelector'

export function PlanView({ store }: { store: AppStore }) {
  const {
    state,
    currentWeek,
    setCurrentWeek,
    discretionaryHours,
    weekData,
    plannedTotal,
    setPlanned,
    addInterest,
    duplicatePlanFromPreviousWeek,
    distributeRemaining,
  } = store

  const [showAdd, setShowAdd] = useState(false)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  const remaining = discretionaryHours - plannedTotal
  const isBalanced = remaining === 0

  const segments = [
    {
      label: 'Sleep',
      hours: state.settings.sleepHours,
      color: '#e5e5e5',
    },
    {
      label: 'Work',
      hours: state.settings.workHours,
      color: '#d4d4d4',
    },
    ...state.interests.map((i) => ({
      label: i.name,
      hours: weekData.planned[i.id] ?? 0,
      color: i.color,
    })),
  ]

  if (remaining > 0) {
    segments.push({ label: 'Unallocated', hours: remaining, color: '#f5f5f5' })
  }

  function handleDuplicate() {
    const copied = duplicatePlanFromPreviousWeek()
    setCopyMessage(copied ? 'Copied from last week' : 'No plan in previous week')
    setTimeout(() => setCopyMessage(null), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium text-neutral-900">Plan</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {formatWeekLabel(currentWeek)}
        </p>
      </div>

      <WeekSelector
        weekStart={currentWeek}
        onChange={setCurrentWeek}
        label="Week"
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleDuplicate}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          Copy last week
        </button>
        {remaining > 0 && state.interests.length > 0 && (
          <button
            type="button"
            onClick={distributeRemaining}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Split {remaining}h evenly
          </button>
        )}
        {copyMessage && (
          <span className="text-xs text-neutral-400">{copyMessage}</span>
        )}
      </div>

      <ProgressBar segments={segments} total={TOTAL_WEEKLY_HOURS} />

      <div className="border-t border-neutral-200 pt-6">
        <p className="mb-4 text-xs uppercase tracking-widest text-neutral-400">
          Fixed
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Sleep</span>
            <span className="font-mono tabular-nums text-neutral-400">
              {state.settings.sleepHours}h
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Work</span>
            <span className="font-mono tabular-nums text-neutral-400">
              {state.settings.workHours}h
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-widest text-neutral-400">
            Interests
          </p>
          <p
            className={`font-mono text-xs tabular-nums ${
              isBalanced ? 'text-neutral-500' : 'text-neutral-900'
            }`}
          >
            {remaining === 0
              ? 'Balanced'
              : remaining > 0
                ? `${remaining}h remaining`
                : `${Math.abs(remaining)}h over`}
          </p>
        </div>

        {state.interests.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              Add interests to allocate your {discretionaryHours} discretionary hours.
            </p>
            <AddInterestPanel
              existingNames={[]}
              onAdd={addInterest}
              autoFocus={false}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {state.interests.map((interest) => (
              <div
                key={interest.id}
                className="flex items-center justify-between gap-4"
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
                <HourInput
                  value={weekData.planned[interest.id] ?? 0}
                  onChange={(h) => setPlanned(interest.id, h)}
                  max={discretionaryHours}
                />
              </div>
            ))}

            {showAdd ? (
              <div className="pt-2">
                <AddInterestPanel
                  existingNames={state.interests.map((i) => i.name)}
                  onAdd={addInterest}
                  autoFocus
                  showSuggestions={false}
                />
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="mt-2 text-xs text-neutral-400 hover:text-neutral-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="text-sm text-neutral-500 hover:text-neutral-900"
              >
                + Add interest
              </button>
            )}
          </div>
        )}

        <p className="mt-6 font-mono text-xs tabular-nums text-neutral-400">
          {plannedTotal} / {discretionaryHours}h discretionary
        </p>
      </div>
    </div>
  )
}
