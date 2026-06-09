import { useEffect, useRef, useState } from 'react'
import { SUGGESTED_INTERESTS } from '../constants'
import { Button } from './ui/Button'

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
    <div className="space-y-4">
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
            className="min-w-0 flex-1 rounded-[var(--radius-md)] bg-[var(--fill-secondary)] px-3.5 py-2.5 text-[15px] outline-none placeholder:text-[var(--label-tertiary)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          />
          <Button type="submit" variant="primary" disabled={!name.trim()}>
            Add
          </Button>
        </div>

        <div className="min-h-[18px] px-1">
          {error ? (
            <p className="text-[13px] text-[var(--danger)]">{error}</p>
          ) : justAdded ? (
            <p className="text-[13px] text-[var(--success)]">Added {justAdded}</p>
          ) : (
            <p className="text-[13px] text-[var(--label-tertiary)]">Press Enter to add</p>
          )}
        </div>
      </form>

      {showSuggestions && availableSuggestions.length > 0 && (
        <div>
          <p className="mb-2 px-1 text-[13px] font-medium text-[var(--label-secondary)]">
            {existingNames.length === 0 ? 'Suggestions' : 'Add more'}
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => tryAdd(suggestion)}
                className="rounded-full bg-[var(--fill-secondary)] px-3.5 py-1.5 text-[14px] font-medium text-[var(--label)] transition-all hover:bg-[var(--fill)] active:scale-95"
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
