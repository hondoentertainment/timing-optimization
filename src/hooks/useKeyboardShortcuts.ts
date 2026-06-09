import { useEffect } from 'react'
import type { View } from '../types'
import { getWeekStart, shiftWeek } from '../utils/week'

const VIEW_KEYS: Record<string, View> = {
  '1': 'home',
  '2': 'plan',
  '3': 'track',
  '4': 'review',
  '5': 'interests',
  '6': 'settings',
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

interface UseKeyboardShortcutsProps {
  view: View
  setView: (view: View) => void
  currentWeek: string
  setCurrentWeek: (week: string) => void
}

export function useKeyboardShortcuts({
  view,
  setView,
  currentWeek,
  setCurrentWeek,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return

      if (e.key in VIEW_KEYS) {
        e.preventDefault()
        setView(VIEW_KEYS[e.key])
        return
      }

      if (e.key === '/') {
        e.preventDefault()
        setView('interests')
        requestAnimationFrame(() => {
          document.getElementById('add-interest-input')?.focus()
        })
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentWeek(shiftWeek(currentWeek, -1))
        return
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentWeek(shiftWeek(currentWeek, 1))
        return
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault()
        setCurrentWeek(getWeekStart())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, setView, currentWeek, setCurrentWeek])
}
