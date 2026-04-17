export type StatusColor = 'green' | 'orange' | 'red'

export function progressColor(ratio: number): StatusColor {
  if (ratio > 0.5) return 'green'
  if (ratio >= 0.1) return 'orange'
  return 'red'
}

export const bgColor: Record<StatusColor, string> = {
  green: 'bg-green-500',
  orange: 'bg-orange-400',
  red: 'bg-red-500',
}

export const textColor: Record<StatusColor, string> = {
  green: 'text-green-600',
  orange: 'text-orange-500',
  red: 'text-red-600',
}
