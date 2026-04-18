export interface HistoryEntry {
  id: string
  date: number
  rating: number
  score?: number
  scores?: { userId: string; score: number }[]
  doneByUserId?: string
  note?: string
  photo?: string
}

export interface Activity {
  id: string
  name: string
  interval: number
  intervalUnit: 'days' | 'weeks'
  /** @deprecated use interval + intervalUnit */
  intervalWeeks?: number
  categoryId?: string
  userId: string
  history: HistoryEntry[]
  isHidden?: boolean
  ratingEnabled?: boolean
  scoreEnabled?: boolean
  scoreLabel?: string
  createdAt: number
}

export interface Category {
  id: string
  name: string
  icon: string
  parentId?: string
  userId: string
  isPrivate: boolean
  createdAt: number
}

export interface User {
  id: string
  username: string
}
