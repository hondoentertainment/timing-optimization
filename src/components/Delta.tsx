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
  if (diff === 0) return <span className="text-neutral-300">—</span>
  const sign = diff > 0 ? '+' : ''
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-xs'
  return (
    <span
      className={`font-mono tabular-nums ${sizeClass} ${
        diff > 0 ? 'text-neutral-700' : 'text-neutral-400'
      }`}
    >
      {sign}
      {diff}h
    </span>
  )
}
