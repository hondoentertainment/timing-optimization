import { useRef, useState } from 'react'
import { TOTAL_WEEKLY_HOURS } from '../types'
import { exportState } from '../storage'
import type { AppStore } from '../hooks/useAppStore'
import { HourInput } from './HourInput'

export function SettingsView({ store }: { store: AppStore }) {
  const { state, discretionaryHours, updateSettings, replaceState, importState } =
    store
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)

  function handleExport() {
    const blob = new Blob([exportState(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `168-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const result = importState(String(reader.result))
      if (!result.ok) {
        setImportMessage(result.error)
      } else {
        replaceState(result.state)
        setImportMessage('Backup restored')
      }
      setTimeout(() => setImportMessage(null), 3000)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium text-neutral-900">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Fixed weekly blocks — consistent across all weeks.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-800">Sleep</p>
            <p className="text-xs text-neutral-400">Hours per week</p>
          </div>
          <HourInput
            value={state.settings.sleepHours}
            onChange={(h) =>
              updateSettings({ ...state.settings, sleepHours: h })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-800">Work</p>
            <p className="text-xs text-neutral-400">Hours per week</p>
          </div>
          <HourInput
            value={state.settings.workHours}
            onChange={(h) =>
              updateSettings({ ...state.settings, workHours: h })
            }
          />
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-6 font-mono text-xs tabular-nums text-neutral-400 space-y-1">
        <p>{TOTAL_WEEKLY_HOURS}h total per week</p>
        <p>
          {state.settings.sleepHours + state.settings.workHours}h fixed ·{' '}
          {discretionaryHours}h for interests
        </p>
      </div>

      <div className="border-t border-neutral-200 pt-6 space-y-4">
        <p className="text-xs uppercase tracking-widest text-neutral-400">
          Backup
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleExport}
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImport(file)
              e.target.value = ''
            }}
          />
        </div>
        {importMessage && (
          <p className="text-xs text-neutral-500">{importMessage}</p>
        )}
      </div>

      <div className="border-t border-neutral-200 pt-6 space-y-2">
        <p className="text-xs uppercase tracking-widest text-neutral-400">
          Shortcuts
        </p>
        <div className="text-sm text-neutral-500 space-y-1">
          <p>
            <span className="font-mono text-neutral-700">1–5</span> Switch tabs
          </p>
          <p>
            <span className="font-mono text-neutral-700">← →</span> Change week
          </p>
          <p>
            <span className="font-mono text-neutral-700">/</span> Focus add interest
          </p>
        </div>
      </div>
    </div>
  )
}
