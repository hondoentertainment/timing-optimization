interface BalanceRingProps {
  value: number
  max: number
  label: string
  sublabel?: string
  size?: number
  color?: string
}

export function BalanceRing({
  value,
  max,
  label,
  sublabel,
  size = 160,
  color = 'var(--accent)',
}: BalanceRingProps) {
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circumference * (1 - pct)

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--fill)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-semibold tabular-nums tracking-tight text-[var(--label)]">
          {label}
        </span>
        {sublabel && (
          <span className="mt-0.5 text-[13px] text-[var(--label-secondary)]">{sublabel}</span>
        )}
      </div>
    </div>
  )
}
