export function calendarDaysSince(timestamp: number): number {
  const now = new Date()
  const then = new Date(timestamp)
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thenDay = new Date(then.getFullYear(), then.getMonth(), then.getDate())
  return Math.floor((nowDay.getTime() - thenDay.getTime()) / 86400000)
}

export function intervalToDays(interval: number, unit: 'days' | 'weeks'): number {
  return unit === 'weeks' ? interval * 7 : interval
}

export function progressRatio(intervalDays: number, lastDoneTs?: number): number {
  if (!lastDoneTs) return 0
  const days = calendarDaysSince(lastDoneTs)
  return Math.max(0, Math.min(1, 1 - days / intervalDays))
}

export function latestDate(history: { date: number }[]): number | undefined {
  if (!history.length) return undefined
  return Math.max(...history.map(h => h.date))
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function daysAgoLabel(ts: number): string {
  const d = calendarDaysSince(ts)
  if (d === 0) return 'Vandaag'
  if (d === 1) return 'Gisteren'
  return `${d} dagen geleden`
}
