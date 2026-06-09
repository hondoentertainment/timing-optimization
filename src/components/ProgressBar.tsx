interface ProgressBarProps {
  segments: { label: string; hours: number; color: string }[]
  total: number
}

export function ProgressBar({ segments, total }: ProgressBarProps) {
  const used = segments.reduce((s, seg) => s + seg.hours, 0)

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-[var(--fill)]">
        {segments.map((seg) =>
          seg.hours > 0 ? (
            <div
              key={seg.label}
              title={`${seg.label}: ${seg.hours}h`}
              className="h-full transition-all duration-500 ease-out first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${(seg.hours / total) * 100}%`,
                backgroundColor: seg.color,
              }}
            />
          ) : null,
        )}
      </div>
      <p className="mt-2.5 text-[13px] tabular-nums text-[var(--label-secondary)]">
        {used} of {total} hours allocated
      </p>
    </div>
  )
}
