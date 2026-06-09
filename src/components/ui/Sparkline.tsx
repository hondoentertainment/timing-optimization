interface SparklineProps {
  values: number[]
  color?: string
  width?: number
  height?: number
}

export function Sparkline({
  values,
  color = 'var(--accent)',
  width = 64,
  height = 24,
}: SparklineProps) {
  if (values.length < 2) {
    return <div style={{ width, height }} className="opacity-30" />
  }

  const max = Math.max(...values, 1)
  const step = width / (values.length - 1)
  const points = values
    .map((v, i) => `${i * step},${height - (v / max) * (height - 4) - 2}`)
    .join(' ')

  return (
    <svg width={width} height={height} aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}
