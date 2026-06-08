import { useEffect, useRef, useState } from 'react'
import { SUGGESTED_INTERESTS } from '../constants'

type AddResult = { ok: true } | { ok: false; reason: 'empty' | 'duplicate' }

interface AddInterestPanelProps {
  existingNames: string[]
  onAdd: (name: string) => AddResult
  autoFocus?: boolean
  showSuggestions?: boolean
}

function normalize(name: string) {
  return name.trim().replace(/\s+/g, ' ')
}

function isDuplicate(name: string, existing: string[]) {
  const n = normalize(name).toLowerCase()
  return existing.some((e) => e.toLowerCase() === n)
}

export function AddInterestPanel({
  existingNames,
  onAdd,
  autoFocus = true,
  showSuggestions = true,
}: AddInterestPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    if (!justAdded) return
    const t = setTimeout(() => setJustAdded(null), 1200)
    return () => clearTimeout(t)
  }, [justAdded])

  const availableSuggestions = SUGGESTED_INTERESTS.filter(
    (s) => !isDuplicate(s, existingNames),
  )

  function tryAdd(raw: string) {
    const trimmed = normalize(raw)
    if (!trimmed) {
      setError('Enter a name')
      return
    }
    if (isDuplicate(trimmed, existingNames)) {
      setError('Already added')
      return
    }

    const result = onAdd(trimmed)
    if (!result.ok) {
      setError(result.reason === 'duplicate' ? 'Already added' : 'Enter a name')
      return
    }

    setName('')
    setError(null)
    setJustAdded(trimmed)
    inputRef.current?.focus()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    tryAdd(name)
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id="add-interest-input"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Type an interest…"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'interest-error' : 'interest-hint'}
            className={`flex-1 border-b bg-transparent py-2 text-sm outline-none placeholder:text-neutral-300 ${
              error
                ? 'border-neutral-900'
                : 'border-neutral-300 focus:border-neutral-900'
            }`}
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="shrink-0 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 disabled:text-neutral-300"
          >
            Add
          </button>
        </div>

        <div className="flex items-center justify-between min-h-[18px]">
          {error ? (
            <p id="interest-error" className="text-xs text-neutral-700">
              {error}
            </p>
          ) : justAdded ? (
            <p className="text-xs text-neutral-500">Added {justAdded}</p>
          ) : (
            <p id="interest-hint" className="text-xs text-neutral-400">
              Press Enter to add
            </p>
          )}
        </div>
      </form>

      {showSuggestions && availableSuggestions.length > 0 && (
        <div>
          <p className="mb-3 text-xs uppercase tracking-widest text-neutral-400">
            {existingNames.length === 0 ? 'Suggestions' : 'Add more'}
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => tryAdd(suggestion)}
                className="rounded-sm border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
