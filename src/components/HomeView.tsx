import type { AppStore } from '../hooks/useAppStore'
import type { View } from '../types'
import { TOTAL_WEEKLY_HOURS } from '../types'
import {
  computeOptimizationScore,
  getDashboardInsights,
} from '../utils/summary'
import { formatWeekLabel } from '../utils/week'
import { Delta } from './Delta'
import { ProgressBar } from './ProgressBar'
import { WeekSelector } from './WeekSelector'
import { BalanceRing } from './ui/BalanceRing'
import { Button } from './ui/Button'
import { Card, CardDivider, CardRow } from './ui/Card'
import { PageHeader, SectionLabel } from './ui/PageHeader'

interface HomeViewProps {
  store: AppStore
  onNavigate: (view: View) => void
}

export function HomeView({ store, onNavigate }: HomeViewProps) {
  const {
    state,
    currentWeek,
    setCurrentWeek,
    goToCurrentWeek,
    discretionaryHours,
    weekData,
    plannedTotal,
    actualTotal,
  } = store

  const remaining = discretionaryHours - plannedTotal
  const score = computeOptimizationScore(
    state,
    currentWeek,
    discretionaryHours,
  )
  const insights = getDashboardInsights(
    state,
    currentWeek,
    discretionaryHours,
    plannedTotal,
  )

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

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Overview"
        subtitle={formatWeekLabel(currentWeek)}
        action={
          <WeekSelector
            weekStart={currentWeek}
            onChange={setCurrentWeek}
            onToday={goToCurrentWeek}
          />
        }
      />

      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center justify-center p-8">
          <BalanceRing
            value={plannedTotal}
            max={discretionaryHours}
            label={remaining === 0 ? 'Balanced' : `${remaining}h`}
            sublabel={
              remaining === 0
                ? `${plannedTotal}h planned`
                : remaining > 0
                  ? 'remaining'
                  : 'over plan'
            }
            color={remaining === 0 ? 'var(--success)' : 'var(--accent)'}
          />
          {score !== null && (
            <p className="mt-4 text-[13px] text-[var(--label-secondary)]">
              Optimization score{' '}
              <span className="font-semibold text-[var(--label)]">{score}%</span>
            </p>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden p-5">
            <SectionLabel>Week at a glance</SectionLabel>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <Stat label="Planned" value={`${plannedTotal}h`} />
              <Stat label="Actual" value={`${actualTotal}h`} />
              <Stat
                label="Delta"
                value={<Delta planned={plannedTotal} actual={actualTotal} size="sm" />}
              />
            </div>
          </Card>

          <Card className="overflow-hidden p-5">
            <SectionLabel>168-hour allocation</SectionLabel>
            <div className="mt-3">
              <ProgressBar segments={segments} total={TOTAL_WEEKLY_HOURS} />
            </div>
          </Card>
        </div>
      </div>

      {insights.length > 0 && (
        <div>
          <SectionLabel>Recommendations</SectionLabel>
          <Card className="mt-2 overflow-hidden">
            {insights.map((insight, i) => (
              <div key={i}>
                {i > 0 && <CardDivider />}
                <CardRow>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      insight.type === 'goal'
                        ? 'bg-[var(--success)]'
                        : insight.type === 'unallocated'
                          ? 'bg-[var(--warning)]'
                          : 'bg-[var(--accent)]'
                    }`}
                  />
                  <span className="text-[15px] text-[var(--label)]">{insight.message}</span>
                </CardRow>
              </div>
            ))}
          </Card>
        </div>
      )}

      <div>
        <SectionLabel>Quick actions</SectionLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => onNavigate('plan')}>
            Plan week
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('track')}>
            Log hours
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('review')}>
            View insights
          </Button>
        </div>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div>
      <p className="text-[13px] text-[var(--label-secondary)]">{label}</p>
      <p className="mt-1 text-[22px] font-semibold tabular-nums tracking-tight text-[var(--label)]">
        {value}
      </p>
    </div>
  )
}
