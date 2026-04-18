import { useNavigate } from 'react-router-dom'
import type { Activity } from '../types'
import { latestDate, progressRatio, intervalToDays, daysAgoLabel } from '../utils/time'
import { progressColor, textColor } from '../utils/color'
import { ProgressBar } from './ProgressBar'

interface Props {
  activity: Activity
  currentUserId: string
  onDone: () => void
}

export function ActivityCard({ activity, currentUserId, onDone }: Props) {
  const navigate = useNavigate()
  const lastDoneTs = latestDate(activity.history)
  const days = activity.interval != null
    ? intervalToDays(activity.interval, activity.intervalUnit)
    : (activity.intervalWeeks ?? 1) * 7
  const ratio = progressRatio(days, lastDoneTs)
  const pct = Math.round(ratio * 100)
  const isOwn = activity.userId === currentUserId

  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm cursor-pointer active:opacity-75"
      onClick={() => navigate(`/activity/${activity.id}/edit`)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900 flex-1 mr-3 truncate">{activity.name}</span>
        <button
          className="shrink-0 text-sm px-3 py-1.5 bg-blue-500 text-white rounded-full font-medium active:bg-blue-600"
          onClick={e => { e.stopPropagation(); onDone() }}
        >
          Gedaan
        </button>
      </div>
      <ProgressBar ratio={ratio} />
      <div className="flex justify-between mt-1.5 text-xs">
        <span className={textColor[progressColor(ratio)]}>{pct}%</span>
        <span className="text-gray-400">
          {lastDoneTs ? daysAgoLabel(lastDoneTs) : 'Nog nooit gedaan'}
        </span>
      </div>
      {activity.scoreEnabled && (
        <div className="mt-1.5 text-xs text-blue-500 font-medium">
          {activity.scoreLabel || 'Score'}: {activity.history.reduce((sum, h) =>
            sum + (h.scores ? h.scores.reduce((s, u) => s + u.score, 0) : (h.score ?? 0)), 0)}
        </div>
      )}
    </div>
  )
}
