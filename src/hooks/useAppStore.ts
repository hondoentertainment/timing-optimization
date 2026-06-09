import { useCallback, useEffect, useState } from 'react'
import { INTEREST_COLORS } from '../constants'
import { importState, loadState, saveState } from '../storage'
import type { AppState, Interest, Settings, WeekData } from '../types'
import { getWeekStart, shiftWeek } from '../utils/week'
import { getRecentWeekStarts } from '../utils/trends'

function emptyWeek(): WeekData {
  return { planned: {}, actual: {}, notes: '' }
}

function ensureWeek(state: AppState, weekStart: string): WeekData {
  return state.weeks[weekStart] ?? emptyWeek()
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ')
}

function roundHalf(n: number) {
  return Math.round(n * 2) / 2
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

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeek(getWeekStart())
  }, [])

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

  const setInterestColor = useCallback((id: string, color: string) => {
    setState((prev) => ({
      ...prev,
      interests: prev.interests.map((i) =>
        i.id === id ? { ...i, color } : i,
      ),
    }))
  }, [])

  const setInterestGoal = useCallback((id: string, goalHours: number) => {
    setState((prev) => ({
      ...prev,
      interests: prev.interests.map((i) =>
        i.id === id ? { ...i, goalHours: Math.max(0, goalHours) } : i,
      ),
    }))
  }, [])

  const reorderInterest = useCallback((id: string, direction: 'up' | 'down') => {
    setState((prev) => {
      const index = prev.interests.findIndex((i) => i.id === id)
      if (index === -1) return prev
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= prev.interests.length) return prev
      const interests = [...prev.interests]
      ;[interests[index], interests[target]] = [interests[target], interests[index]]
      return { ...prev, interests }
    })
  }, [])

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

  const replanFromActuals = useCallback(
    (source: 'lastWeek' | 'fourWeekAvg'): boolean => {
      let applied = false

      setState((prev) => {
        const week = ensureWeek(prev, currentWeek)
        const planned: Record<string, number> = { ...week.planned }

        if (source === 'lastWeek') {
          const prevData = ensureWeek(prev, shiftWeek(currentWeek, -1))
          const hasActual = prev.interests.some(
            (i) => (prevData.actual[i.id] ?? 0) > 0,
          )
          if (!hasActual) return prev
          applied = true
          for (const interest of prev.interests) {
            planned[interest.id] = prevData.actual[interest.id] ?? 0
          }
        } else {
          const weeks = getRecentWeekStarts(shiftWeek(currentWeek, -1), 4)
          const hasAny = weeks.some((w) =>
            prev.interests.some(
              (i) => (ensureWeek(prev, w).actual[i.id] ?? 0) > 0,
            ),
          )
          if (!hasAny) return prev
          applied = true
          for (const interest of prev.interests) {
            let sum = 0
            for (const w of weeks) {
              sum += ensureWeek(prev, w).actual[interest.id] ?? 0
            }
            planned[interest.id] = roundHalf(sum / weeks.length)
          }
        }

        return {
          ...prev,
          weeks: {
            ...prev.weeks,
            [currentWeek]: { ...week, planned },
          },
        }
      })

      return applied
    },
    [currentWeek],
  )

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
    goToCurrentWeek,
    discretionaryHours,
    weekData,
    plannedTotal,
    actualTotal,
    updateSettings,
    addInterest,
    renameInterest,
    setInterestColor,
    setInterestGoal,
    reorderInterest,
    removeInterest,
    setPlanned,
    setActual,
    setWeekNotes,
    duplicatePlanFromPreviousWeek,
    replanFromActuals,
    distributeRemaining,
    replaceState,
    importState,
  }
}

export type AppStore = ReturnType<typeof useAppStore>
