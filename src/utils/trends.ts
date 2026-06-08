export function getRecentWeekStarts(endWeek: string, count: number): string[] {
  const weeks: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(endWeek + 'T12:00:00')
    d.setDate(d.getDate() - i * 7)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    weeks.push(`${y}-${m}-${day}`)
  }
  return weeks
}
