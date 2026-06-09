import { INTEREST_COLORS } from '../../constants'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {INTEREST_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="h-7 w-7 rounded-full transition-transform hover:scale-110 active:scale-95"
          style={{
            backgroundColor: color,
            boxShadow:
              value === color
                ? `0 0 0 2px var(--bg-elevated), 0 0 0 4px ${color}`
                : 'none',
          }}
          aria-label={`Color ${color}`}
          aria-pressed={value === color}
        />
      ))}
      <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[var(--fill-secondary)] text-[10px] font-medium text-[var(--label-secondary)]">
        +
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  )
}
