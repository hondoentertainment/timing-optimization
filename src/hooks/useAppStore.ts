import { useCallback, useEffect, useState } from 'react'
import { INTEREST_COLORS } from '../constants'
import { importState, loadState, saveState } from '../storage'
import type { AppState, Interest, Settings, WeekData } from '../types'
import { getWeekStart, shiftWeek } from '../utils/week'

function emptyWeek(): WeekData {
  return { planned: {}, actual: {}, notes: '' }
}

function ensureWeek(state: AppState, weekStart: string): WeekData {
  return state.weeks[weekStart] ?? emptyWeek()
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ')
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(loadState)
  const [currentWeek, setCurrentWeek] = useState(getWeekStart)

  useEffect(() => {
    saveState(state)
  }, [state])

  const discretionaryHours =
    168 - state.settings.sleepHours - state.settings.workHours

  const weekData = ensureWeek(state, currentWeek)

  const updateSettings = useCallback((settings: Settings) => {
    setState((prev) => ({ ...prev, settings }))
  }, [])

  const addInterest = useCallback(
    (
      name: string,
    ):
      | { ok: true; id: string }
      | { ok: false; reason: 'empty' | 'duplicate' } => {
      const trimmed = normalizeName(name)
      if (!trimmed) return { ok: false, reason: 'empty' }

      let result:
        | { ok: true; id: string }
        | { ok: false; reason: 'duplicate' } = {
        ok: false,
        reason: 'duplicate',
      }

      setState((prev) => {
        if (
          prev.interests.some(
            (i) => i.name.toLowerCase() === trimmed.toLowerCase(),
          )
        ) {
          result = { ok: false, reason: 'duplicate' }
          return prev
        }

        const id = crypto.randomUUID()
        const color =
          INTEREST_COLORS[prev.interests.length % INTEREST_COLORS.length]
        const interest: Interest = { id, name: trimmed, color }
        result = { ok: true, id }

        return {
          ...prev,
          interests: [...prev.interests, interest],
          weeks: {
            ...prev.weeks,
            [currentWeek]: {
              ...ensureWeek(prev, currentWeek),
              planned: {
                ...ensureWeek(prev, currentWeek).planned,
                [id]: 0,
              },
              actual: {
                ...ensureWeek(prev, currentWeek).actual,
                [id]: 0,
              },
            },
          },
        }
      })

      return result
    },
    [currentWeek],
  )

  const renameInterest = useCallback(
    (id: string, name: string): { ok: true } | { ok: false; reason: 'empty' | 'duplicate' } => {
      const trimmed = normalizeName(name)
      if (!trimmed) return { ok: false, reason: 'empty' }

      let result: { ok: true } | { ok: false; reason: 'duplicate' } = {
        ok: false,
        reason: 'duplicate',
      }

      setState((prev) => {
        if (
          prev.interests.some(
            (i) => i.id !== id && i.name.toLowerCase() === trimmed.toLowerCase(),
          )
        ) {
          result = { ok: false, reason: 'duplicate' }
          return prev
        }

        result = { ok: true }
        return {
          ...prev,
          interests: prev.interests.map((i) =>
            i.id === id ? { ...i, name: trimmed } : i,
          ),
        }
      })

      return result
    },
    [],
  )

  const removeInterest = useCallback((id: string) => {
    setState((prev) => {
      const weeks = { ...prev.weeks }
      for (const key of Object.keys(weeks)) {
        const week = weeks[key]
        const { [id]: _p, ...planned } = week.planned
        const { [id]: _a, ...actual } = week.actual
        weeks[key] = { ...week, planned, actual }
      }
      return {
        ...prev,
        interests: prev.interests.filter((i) => i.id !== id),
        weeks,
      }
    })
  }, [])

  const setPlanned = useCallback(
    (interestId: string, hours: number) => {
      setState((prev) => {
        const week = ensureWeek(prev, currentWeek)
        return {
          ...prev,
          weeks: {
            ...prev.weeks,
            [currentWeek]: {
              ...week,
              planned: { ...week.planned, [interestId]: Math.max(0, hours) },
            },
          },
        }
      })
    },
    [currentWeek],
  )

  const setActual = useCallback(
    (interestId: string, hours: number) => {
      setState((prev) => {
        const week = ensureWeek(prev, currentWeek)
        return {
          ...prev,
          weeks: {
            ...prev.weeks,
            [currentWeek]: {
              ...week,
              actual: { ...week.actual, [interestId]: Math.max(0, hours) },
            },
          },
        }
      })
    },
    [currentWeek],
  )

  const setWeekNotes = useCallback(
    (notes: string) => {
      setState((prev) => {
        const week = ensureWeek(prev, currentWeek)
        return {
          ...prev,
          weeks: {
            ...prev.weeks,
            [currentWeek]: { ...week, notes },
          },
        }
      })
    },
    [currentWeek],
  )

  const duplicatePlanFromPreviousWeek = useCallback((): boolean => {
    const prevWeek = shiftWeek(currentWeek, -1)
    let copied = false

    setState((prev) => {
      const prevData = ensureWeek(prev, prevWeek)
      const hasPlan = prev.interests.some(
        (i) => (prevData.planned[i.id] ?? 0) > 0,
      )
      if (!hasPlan) return prev

      copied = true
      const week = ensureWeek(prev, currentWeek)
      const planned: Record<string, number> = {}
      for (const interest of prev.interests) {
        planned[interest.id] = prevData.planned[interest.id] ?? 0
      }

      return {
        ...prev,
        weeks: {
          ...prev.weeks,
          [currentWeek]: { ...week, planned },
        },
      }
    })

    return copied
  }, [currentWeek])

  const distributeRemaining = useCallback(() => {
    setState((prev) => {
      const week = ensureWeek(prev, currentWeek)
      const n = prev.interests.length
      if (n === 0) return prev

      const plannedTotal = prev.interests.reduce(
        (sum, i) => sum + (week.planned[i.id] ?? 0),
        0,
      )
      const discretionary =
        168 - prev.settings.sleepHours - prev.settings.workHours
      let remaining = discretionary - plannedTotal
      if (remaining <= 0) return prev

      const planned = { ...week.planned }
      const base = Math.floor((remaining / n) * 2) / 2
      let leftover = Math.round((remaining - base * n) * 2) / 2

      for (const interest of prev.interests) {
        let add = base
        if (leftover >= 0.5) {
          add += 0.5
          leftover -= 0.5
        }
        planned[interest.id] = (planned[interest.id] ?? 0) + add
      }

      return {
        ...prev,
        weeks: {
          ...prev.weeks,
          [currentWeek]: { ...week, planned },
        },
      }
    })
  }, [currentWeek])

  const replaceState = useCallback((next: AppState) => {
    setState(next)
  }, [])

  const plannedTotal = state.interests.reduce(
    (sum, i) => sum + (weekData.planned[i.id] ?? 0),
    0,
  )

  const actualTotal = state.interests.reduce(
    (sum, i) => sum + (weekData.actual[i.id] ?? 0),
    0,
  )

  return {
    state,
    currentWeek,
    setCurrentWeek,
    discretionaryHours,
    weekData,
    plannedTotal,
    actualTotal,
    updateSettings,
    addInterest,
    renameInterest,
    removeInterest,
    setPlanned,
    setActual,
    setWeekNotes,
    duplicatePlanFromPreviousWeek,
    distributeRemaining,
    replaceState,
    importState,
  }
}

export type AppStore = ReturnType<typeof useAppStore>
