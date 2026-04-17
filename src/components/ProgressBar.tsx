import { bgColor, progressColor } from '../utils/color'

export function ProgressBar({ ratio }: { ratio: number }) {
  const pct = Math.round(ratio * 100)
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all ${bgColor[progressColor(ratio)]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
