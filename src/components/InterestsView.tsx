import { useRef, useState } from 'react'
import type { AppStore } from '../hooks/useAppStore'
import { AddInterestPanel } from './AddInterestPanel'

export function InterestsView({ store }: { store: AppStore }) {
  const { state, addInterest, renameInterest, removeInterest } = store
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
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

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditError(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium text-neutral-900">Interests</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Specific activities you want time for — piano, hiking, Python, etc.
        </p>
      </div>

      <AddInterestPanel
        existingNames={state.interests.map((i) => i.name)}
        onAdd={handleAdd}
      />

      {state.interests.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Pick a suggestion or type your own to get started.
        </p>
      ) : (
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-neutral-400">
            {state.interests.length}{' '}
            {state.interests.length === 1 ? 'interest' : 'interests'}
          </p>
          <ul className="divide-y divide-neutral-100">
            {state.interests.map((interest) => (
              <li
                key={interest.id}
                className={`flex items-center justify-between py-3 transition-colors duration-500 ${
                  recentlyAddedId === interest.id ? 'bg-neutral-50 -mx-2 px-2' : ''
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: interest.color }}
                  />
                  {editingId === interest.id ? (
                    <div className="flex-1">
                      <input
                        ref={editRef}
                        type="text"
                        value={editName}
                        onChange={(e) => {
                          setEditName(e.target.value)
                          if (editError) setEditError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        onBlur={commitEdit}
                        className="w-full border-b border-neutral-900 bg-transparent py-0.5 text-sm outline-none"
                      />
                      {editError && (
                        <p className="mt-1 text-xs text-neutral-600">{editError}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(interest.id, interest.name)}
                      className="truncate text-sm text-neutral-800 text-left hover:text-neutral-600"
                      title="Click to rename"
                    >
                      {interest.name}
                    </button>
                  )}
                </div>
                {editingId !== interest.id && (
                  <button
                    type="button"
                    onClick={() => removeInterest(interest.id)}
                    className="ml-4 shrink-0 text-xs text-neutral-400 hover:text-neutral-700"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
