import type { AppState, DashboardInsight, TrendRow } from '../types'
import { getRecentWeekStarts } from './trends'

function ensureWeek(state: AppState, weekStart: string) {
  return state.weeks[weekStart] ?? { planned: {}, actual: {} }
}

function roundHalf(n: number): number {
  return Math.round(n * 2) / 2
}

export function computeOptimizationScore(
  state: AppState,
  weekStart: string,
  discretionaryHours: number,
): number | null {
  if (state.interests.length === 0 || discretionaryHours === 0) return null
  const data = ensureWeek(state, weekStart)
  const actualTotal = state.interests.reduce(
    (s, i) => s + (data.actual[i.id] ?? 0),
    0,
  )
  if (actualTotal === 0) return null

  const totalDelta = state.interests.reduce((s, i) => {
    const planned = data.planned[i.id] ?? 0
    const actual = data.actual[i.id] ?? 0
    return s + Math.abs(actual - planned)
  }, 0)

  return Math.max(0, Math.round(100 - (totalDelta / discretionaryHours) * 100))
}

export function computeTrends(
  state: AppState,
  endWeek: string,
  weekCount = 4,
): TrendRow[] {
  const weeks = getRecentWeekStarts(endWeek, weekCount)

  return state.interests.map((interest) => {
    let plannedSum = 0
    let actualSum = 0
    const weeklyActuals: number[] = []
    let underWeeks = 0

    for (const week of weeks) {
      const data = ensureWeek(state, week)
      const planned = data.planned[interest.id] ?? 0
      const actual = data.actual[interest.id] ?? 0
      plannedSum += planned
      actualSum += actual
      weeklyActuals.push(actual)
      if (planned > 0 && actual < planned) underWeeks++
    }

    const avgPlanned = roundHalf(plannedSum / weekCount)
    const avgActual = roundHalf(actualSum / weekCount)

    return {
      interestId: interest.id,
      name: interest.name,
      color: interest.color,
      avgPlanned,
      avgActual,
      avgDelta: roundHalf(avgActual - avgPlanned),
      weeklyActuals,
      chronicUnder: underWeeks >= 3 && avgPlanned > 0,
    }
  })
}

export function getWeeklyHighlights(
  state: AppState,
  weekStart: string,
): { over: { name: string; delta: number } | null; under: { name: string; delta: number } | null } {
  let over: { name: string; delta: number } | null = null
  let under: { name: string; delta: number } | null = null
  const data = ensureWeek(state, weekStart)

  for (const interest of state.interests) {
    const planned = data.planned[interest.id] ?? 0
    const actual = data.actual[interest.id] ?? 0
    const delta = actual - planned
    if (delta > 0 && (!over || delta > over.delta)) {
      over = { name: interest.name, delta }
    }
    if (delta < 0 && (!under || delta < under.delta)) {
      under = { name: interest.name, delta }
    }
  }

  return { over, under }
}

export function getDashboardInsights(
  state: AppState,
  weekStart: string,
  discretionaryHours: number,
  plannedTotal: number,
): DashboardInsight[] {
  const insights: DashboardInsight[] = []
  const data = ensureWeek(state, weekStart)
  const trends = computeTrends(state, weekStart, 4)

  if (discretionaryHours - plannedTotal > 0) {
    insights.push({
      type: 'unallocated',
      interestName: '',
      message: `${discretionaryHours - plannedTotal}h still unallocated this week`,
    })
  }

  for (const row of trends.filter((t) => t.chronicUnder)) {
    insights.push({
      type: 'under',
      interestName: row.name,
      message: `${row.name} has been under plan for 3+ weeks`,
    })
  }

  for (const interest of state.interests) {
    if (interest.goalHours && interest.goalHours > 0) {
      const actual = data.actual[interest.id] ?? 0
      if (actual >= interest.goalHours) {
        insights.push({
          type: 'goal',
          interestName: interest.name,
          message: `${interest.name} goal reached (${actual}h)`,
        })
      }
    }
  }

  const highlights = getWeeklyHighlights(state, weekStart)
  if (highlights.under) {
    insights.push({
      type: 'under',
      interestName: highlights.under.name,
      message: `${highlights.under.name} is ${Math.abs(highlights.under.delta)}h below plan`,
    })
  }

  return insights.slice(0, 4)
}
