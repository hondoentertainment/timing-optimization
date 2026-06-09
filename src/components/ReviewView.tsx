import { useState } from 'react'
import type { AppStore } from '../hooks/useAppStore'
import {
  computeOptimizationScore,
  computeTrends,
  getWeeklyHighlights,
} from '../utils/summary'
import { formatWeekLabel } from '../utils/week'
import { Delta } from './Delta'
import { WeekSelector } from './WeekSelector'
import { BalanceRing } from './ui/BalanceRing'
import { Card, CardDivider, CardRow } from './ui/Card'
import { PageHeader, SectionLabel } from './ui/PageHeader'
import { Sparkline } from './ui/Sparkline'

export function ReviewView({ store }: { store: AppStore }) {
  const {
    state,
    currentWeek,
    setCurrentWeek,
    goToCurrentWeek,
    weekData,
    plannedTotal,
    actualTotal,
    discretionaryHours,
  } = store

  const [trendWeeks, setTrendWeeks] = useState<4 | 8 | 12>(4)
  const highlights = getWeeklyHighlights(state, currentWeek)
  const trends = computeTrends(state, currentWeek, trendWeeks)
  const score = computeOptimizationScore(state, currentWeek, discretionaryHours)

  const rows = state.interests
    .map((interest) => {
      const planned = weekData.planned[interest.id] ?? 0
      const actual = weekData.actual[interest.id] ?? 0
      return { interest, planned, actual, absDelta: Math.abs(actual - planned) }
    })
    .sort((a, b) => b.absDelta - a.absDelta)

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Insights"
        subtitle={formatWeekLabel(currentWeek)}
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
            Add interests and log hours to unlock insights.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            {score !== null && (
              <Card className="flex flex-col items-center justify-center p-6">
                <BalanceRing
                  value={score}
                  max={100}
                  label={`${score}%`}
                  sublabel="optimization"
                  size={140}
                  color={score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--accent)' : 'var(--warning)'}
                />
              </Card>
            )}

            <Card className="p-5">
              <SectionLabel>This week</SectionLabel>
              <div className="mt-3 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[13px] text-[var(--label-secondary)]">Planned</p>
                  <p className="mt-1 text-[22px] font-semibold tabular-nums">{plannedTotal}h</p>
                </div>
                <div>
                  <p className="text-[13px] text-[var(--label-secondary)]">Actual</p>
                  <p className="mt-1 text-[22px] font-semibold tabular-nums">{actualTotal}h</p>
                </div>
                <div>
                  <p className="text-[13px] text-[var(--label-secondary)]">Delta</p>
                  <p className="mt-1 text-[22px] font-semibold">
                    <Delta planned={plannedTotal} actual={actualTotal} size="sm" />
                  </p>
                </div>
              </div>
              {(highlights.over || highlights.under) && (
                <div className="mt-4 space-y-1 text-[14px] text-[var(--label-secondary)]">
                  {highlights.over && (
                    <p>Most over: {highlights.over.name} (+{highlights.over.delta}h)</p>
                  )}
                  {highlights.under && (
                    <p>Most under: {highlights.under.name} ({highlights.under.delta}h)</p>
                  )}
                </div>
              )}
              {weekData.notes && (
                <p className="mt-4 border-l-2 border-[var(--separator)] pl-3 text-[14px] italic text-[var(--label-secondary)]">
                  {weekData.notes}
                </p>
              )}
            </Card>
          </div>

          <div>
            <SectionLabel>By interest</SectionLabel>
            <Card className="mt-2 overflow-hidden">
              {rows.map(({ interest, planned, actual }, i) => (
                <div key={interest.id}>
                  {i > 0 && <CardDivider />}
                  <CardRow>
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: interest.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[15px] text-[var(--label)]">
                      {interest.name}
                    </span>
                    <span className="text-[13px] tabular-nums text-[var(--label-secondary)]">
                      {planned}h → {actual}h
                    </span>
                    <Delta planned={planned} actual={actual} />
                  </CardRow>
                </div>
              ))}
            </Card>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <SectionLabel>Trends</SectionLabel>
              <div className="flex gap-1 rounded-lg bg-[var(--fill-secondary)] p-0.5">
                {([4, 8, 12] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTrendWeeks(n)}
                    className={`rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors ${
                      trendWeeks === n
                        ? 'bg-[var(--bg-elevated)] text-[var(--label)] shadow-sm'
                        : 'text-[var(--label-secondary)]'
                    }`}
                  >
                    {n}w
                  </button>
                ))}
              </div>
            </div>

            <Card className="overflow-hidden">
              {trends.map((row, i) => (
                <div key={row.interestId}>
                  {i > 0 && <CardDivider />}
                  <div className="flex items-center gap-4 px-4 py-3.5">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[15px] font-medium text-[var(--label)]">
                          {row.name}
                        </span>
                        {row.chronicUnder && (
                          <span className="rounded-md bg-[var(--accent-soft)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                            under plan
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[13px] tabular-nums text-[var(--label-secondary)]">
                        avg {row.avgPlanned}h plan · {row.avgActual}h actual
                      </p>
                    </div>
                    <Sparkline values={row.weeklyActuals} color={row.color} />
                    <Delta planned={row.avgPlanned} actual={row.avgActual} />
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
