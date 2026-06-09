import { useRef, useState } from 'react'
import { TOTAL_WEEKLY_HOURS } from '../types'
import { exportState } from '../storage'
import type { AppStore } from '../hooks/useAppStore'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { PageHeader, SectionLabel } from './ui/PageHeader'

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
        if (!window.confirm('Replace all current data with this backup?')) return
        replaceState(result.state)
        setImportMessage('Backup restored')
      }
      setTimeout(() => setImportMessage(null), 3000)
    }
    reader.readAsText(file)
  }

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Fixed blocks and data management"
      />

      <div>
        <SectionLabel>Fixed weekly blocks</SectionLabel>
        <Card className="mt-2 overflow-hidden divide-y divide-[var(--separator)]">
          <SettingRow
            label="Sleep"
            detail="Hours per week"
            value={state.settings.sleepHours}
            onChange={(h) => updateSettings({ ...state.settings, sleepHours: h })}
          />
          <SettingRow
            label="Work"
            detail="Hours per week"
            value={state.settings.workHours}
            onChange={(h) => updateSettings({ ...state.settings, workHours: h })}
          />
        </Card>
        <p className="mt-3 px-1 text-[13px] tabular-nums text-[var(--label-secondary)]">
          {TOTAL_WEEKLY_HOURS}h total · {state.settings.sleepHours + state.settings.workHours}h fixed ·{' '}
          {discretionaryHours}h discretionary
        </p>
      </div>

      <div>
        <SectionLabel>Backup</SectionLabel>
        <Card className="mt-2 p-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExport}>Export JSON</Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              Import JSON
            </Button>
          </div>
          {importMessage && (
            <p className="mt-3 text-[13px] text-[var(--label-secondary)]">{importMessage}</p>
          )}
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
        </Card>
      </div>

      <div>
        <SectionLabel>Keyboard shortcuts</SectionLabel>
        <Card className="mt-2 overflow-hidden divide-y divide-[var(--separator)]">
          {[
            ['1 – 6', 'Switch sections'],
            ['← →', 'Change week'],
            ['/', 'Focus add interest'],
            ['T', 'Jump to this week'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between px-4 py-3">
              <span className="text-[15px] text-[var(--label)]">{desc}</span>
              <kbd className="rounded-md bg-[var(--fill-secondary)] px-2 py-1 font-mono text-[13px] text-[var(--label-secondary)]">
                {key}
              </kbd>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

function SettingRow({
  label,
  detail,
  value,
  onChange,
}: {
  label: string
  detail: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div>
        <p className="text-[15px] font-medium text-[var(--label)]">{label}</p>
        <p className="text-[13px] text-[var(--label-secondary)]">{detail}</p>
      </div>
      <input
        type="number"
        min={0}
        max={168}
        step={0.5}
        value={value || ''}
        onChange={(e) => {
          const n = parseFloat(e.target.value)
          onChange(Number.isNaN(n) ? 0 : n)
        }}
        className="w-16 rounded-lg bg-[var(--fill-secondary)] px-2 py-1.5 text-right text-[15px] font-semibold tabular-nums outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
      />
    </div>
  )
}
