interface ProgressBarProps {
  segments: { label: string; hours: number; color: string }[]
  total: number
}

export function ProgressBar({ segments, total }: ProgressBarProps) {
  const used = segments.reduce((s, seg) => s + seg.hours, 0)

  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-sm bg-neutral-200">
        {segments.map((seg) =>
          seg.hours > 0 ? (
            <div
              key={seg.label}
              title={`${seg.label}: ${seg.hours}h`}
              style={{
                width: `${(seg.hours / total) * 100}%`,
                backgroundColor: seg.color,
              }}
            />
          ) : null,
        )}
      </div>
      <p className="mt-2 font-mono text-xs tabular-nums text-neutral-500">
        {used} / {total}h allocated
      </p>
    </div>
  )
}
