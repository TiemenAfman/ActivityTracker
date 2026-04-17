import { useNavigate } from 'react-router-dom'
import type { Activity, Category } from '../types'
import { latestDate, progressRatio, intervalToDays } from '../utils/time'
import { progressColor, bgColor } from '../utils/color'

interface Props {
  category: Category
  allCategories: Category[]
  allActivities: Activity[]
  currentUserId: string
  onEdit: () => void
}

function worstRatio(
  categoryId: string,
  allCategories: Category[],
  allActivities: Activity[]
): number {
  const direct = allActivities.filter(a => a.categoryId === categoryId && !a.isHidden)
  const subs = allCategories.filter(c => c.parentId === categoryId)

  let worst = 1
  for (const a of direct) {
    const days = a.interval != null ? intervalToDays(a.interval, a.intervalUnit) : (a.intervalWeeks ?? 1) * 7
    const r = progressRatio(days, latestDate(a.history))
    if (r < worst) worst = r
  }
  for (const s of subs) {
    const r = worstRatio(s.id, allCategories, allActivities)
    if (r < worst) worst = r
  }
  return worst
}

export function CategoryCard({ category, allCategories, allActivities, currentUserId, onEdit }: Props) {
  const navigate = useNavigate()
  const ratio = worstRatio(category.id, allCategories, allActivities)
  const color = progressColor(ratio)
  const isOwn = category.userId === currentUserId

  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm flex items-center cursor-pointer active:opacity-75 overflow-hidden relative"
      onClick={() => navigate(`/category/${category.id}`)}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${bgColor[color]}`} />
      <span className="text-2xl mr-3 ml-2">{category.icon}</span>
      <span className="flex-1 font-medium text-gray-900 truncate">{category.name}</span>
      <button
        className="text-gray-400 text-base ml-2 p-1 active:text-gray-600"
        onClick={e => { e.stopPropagation(); onEdit() }}
      >
        ℹ️
      </button>
    </div>
  )
}
