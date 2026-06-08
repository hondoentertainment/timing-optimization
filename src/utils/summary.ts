import type { AppState, TrendRow } from '../types'
import { getRecentWeekStarts } from './trends'

function ensureWeek(state: AppState, weekStart: string) {
  return state.weeks[weekStart] ?? { planned: {}, actual: {} }
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
    for (const week of weeks) {
      const data = ensureWeek(state, week)
      plannedSum += data.planned[interest.id] ?? 0
      actualSum += data.actual[interest.id] ?? 0
    }
    const avgPlanned = plannedSum / weekCount
    const avgActual = actualSum / weekCount
    return {
      interestId: interest.id,
      name: interest.name,
      color: interest.color,
      avgPlanned: roundHalf(avgPlanned),
      avgActual: roundHalf(avgActual),
      avgDelta: roundHalf(avgActual - avgPlanned),
    }
  })
}

function roundHalf(n: number): number {
  return Math.round(n * 2) / 2
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
