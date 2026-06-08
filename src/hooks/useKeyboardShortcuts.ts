import { useEffect } from 'react'
import type { View } from '../types'
import { shiftWeek } from '../utils/week'

const VIEW_KEYS: Record<string, View> = {
  '1': 'plan',
  '2': 'track',
  '3': 'review',
  '4': 'interests',
  '5': 'settings',
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
        if (view !== 'interests' && view !== 'plan') setView('interests')
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
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, setView, currentWeek, setCurrentWeek])
}
