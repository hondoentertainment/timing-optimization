interface HourInputProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

export function HourInput({ value, onChange, max = 168 }: HourInputProps) {
  return (
    <input
      type="number"
      min={0}
      max={max}
      step={0.5}
      value={value || ''}
      onChange={(e) => {
        const n = parseFloat(e.target.value)
        onChange(Number.isNaN(n) ? 0 : n)
      }}
      className="w-16 border-b border-neutral-300 bg-transparent py-1 text-right font-mono text-sm tabular-nums outline-none focus:border-neutral-900"
    />
  )
}
