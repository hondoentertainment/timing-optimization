interface HourSliderProps {
  value: number
  onChange: (value: number) => void
  max: number
  color?: string
}

export function HourSlider({ value, onChange, max, color }: HourSliderProps) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        min={0}
        max={max}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="min-w-0 flex-1"
        style={
          color
            ? ({
                ['--thumb-color' as string]: color,
              } as React.CSSProperties)
            : undefined
        }
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <span className="w-12 shrink-0 text-right text-[15px] font-medium tabular-nums text-[var(--label)]">
        {value}h
      </span>
    </div>
  )
}
