import { useRef, useState } from 'react'
import type { AppStore } from '../hooks/useAppStore'
import { AddInterestPanel } from './AddInterestPanel'
import { Button } from './ui/Button'
import { Card, CardDivider, CardRow } from './ui/Card'
import { ColorPicker } from './ui/ColorPicker'
import { PageHeader, SectionLabel } from './ui/PageHeader'

export function InterestsView({ store }: { store: AppStore }) {
  const {
    state,
    addInterest,
    renameInterest,
    setInterestColor,
    setInterestGoal,
    reorderInterest,
    removeInterest,
  } = store
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const editRef = useRef<HTMLInputElement>(null)

  function handleAdd(name: string) {
    const result = addInterest(name)
    if (result.ok) {
      setRecentlyAddedId(result.id)
      setTimeout(() => setRecentlyAddedId(null), 1200)
    }
    return result
  }

  function startEdit(id: string, name: string) {
    setEditingId(id)
    setEditName(name)
    setEditError(null)
    requestAnimationFrame(() => editRef.current?.focus())
  }

  function commitEdit() {
    if (!editingId) return
    const result = renameInterest(editingId, editName)
    if (!result.ok) {
      setEditError(result.reason === 'duplicate' ? 'Already exists' : 'Enter a name')
      return
    }
    setEditingId(null)
    setEditName('')
    setEditError(null)
  }

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Interests"
        subtitle="Specific activities you optimize time for"
      />

      <Card className="p-5">
        <AddInterestPanel
          existingNames={state.interests.map((i) => i.name)}
          onAdd={handleAdd}
        />
      </Card>

      {state.interests.length === 0 ? (
        <p className="px-1 text-[15px] text-[var(--label-secondary)]">
          Pick a suggestion or type your own to get started.
        </p>
      ) : (
        <div>
          <SectionLabel>{state.interests.length} interests</SectionLabel>
          <Card className="mt-2 overflow-hidden">
            {state.interests.map((interest, index) => (
              <div key={interest.id}>
                {index > 0 && <CardDivider />}
                <div
                  className={`transition-colors duration-500 ${
                    recentlyAddedId === interest.id ? 'bg-[var(--accent-soft)]' : ''
                  }`}
                >
                  <CardRow onClick={() => setExpandedId(expandedId === interest.id ? null : interest.id)}>
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: interest.color }}
                    />
                    {editingId === interest.id ? (
                      <input
                        ref={editRef}
                        type="text"
                        value={editName}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          setEditName(e.target.value)
                          if (editError) setEditError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit()
                          if (e.key === 'Escape') {
                            setEditingId(null)
                            setEditError(null)
                          }
                        }}
                        onBlur={commitEdit}
                        className="min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none"
                      />
                    ) : (
                      <span
                        className="min-w-0 flex-1 truncate text-[15px] font-medium text-[var(--label)]"
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          startEdit(interest.id, interest.name)
                        }}
                      >
                        {interest.name}
                      </span>
                    )}
                    {interest.goalHours ? (
                      <span className="text-[13px] tabular-nums text-[var(--label-secondary)]">
                        {interest.goalHours}h/wk
                      </span>
                    ) : null}
                    <span className="text-[var(--label-tertiary)]">
                      {expandedId === interest.id ? '▾' : '▸'}
                    </span>
                  </CardRow>

                  {expandedId === interest.id && (
                    <div className="space-y-4 border-t border-[var(--separator)] bg-[var(--fill-secondary)]/40 px-4 py-4">
                      <div>
                        <p className="mb-2 text-[13px] font-medium text-[var(--label-secondary)]">Color</p>
                        <ColorPicker
                          value={interest.color}
                          onChange={(c) => setInterestColor(interest.id, c)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-medium text-[var(--label-secondary)]">Weekly goal</p>
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          value={interest.goalHours ?? ''}
                          placeholder="—"
                          onChange={(e) =>
                            setInterestGoal(
                              interest.id,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-16 rounded-lg bg-[var(--bg-elevated)] px-2 py-1.5 text-right text-[15px] font-medium tabular-nums outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={index === 0}
                          onClick={() => reorderInterest(interest.id, 'up')}
                        >
                          Move up
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={index === state.interests.length - 1}
                          onClick={() => reorderInterest(interest.id, 'down')}
                        >
                          Move down
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(interest.id, interest.name)}
                        >
                          Rename
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="ml-auto"
                          onClick={() => removeInterest(interest.id)}
                        >
                          Remove
                        </Button>
                      </div>
                      {editError && editingId === interest.id && (
                        <p className="text-[13px] text-[var(--danger)]">{editError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}
