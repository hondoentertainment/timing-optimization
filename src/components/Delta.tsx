export function Delta({
  planned,
  actual,
  size = 'xs',
}: {
  planned: number
  actual: number
  size?: 'xs' | 'sm'
}) {
  const diff = actual - planned
  if (diff === 0) return <span className="text-[var(--label-tertiary)]">—</span>
  const sign = diff > 0 ? '+' : ''
  const sizeClass = size === 'sm' ? 'text-[15px]' : 'text-[13px]'
  const color =
    diff > 0 ? 'text-[var(--success)]' : 'text-[var(--label-secondary)]'
  return (
    <span className={`font-medium tabular-nums ${sizeClass} ${color}`}>
      {sign}
      {diff}h
    </span>
  )
}
