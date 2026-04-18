import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActivities, getCategories, getUsers } from '../api'
import type { Activity, Category, User } from '../types'

function monthKey(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [year, month] = key.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleString('nl-NL', { month: 'long', year: 'numeric' })
}

function prevMonth(key: string) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 2)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(key: string) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

type Tab = 'gebruikers' | 'activiteiten'

export function ProfilePage() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedMonth, setSelectedMonth] = useState(monthKey(Date.now()))
  const [tab, setTab] = useState<Tab>('gebruikers')

  useEffect(() => {
    Promise.all([getActivities(), getCategories(), getUsers()]).then(([acts, cats, usrs]) => {
      setActivities(acts)
      setCategories(cats)
      setUsers(usrs)
    })
  }, [])

  const usernameById = Object.fromEntries(users.map(u => [u.id, u.username]))
  const categoryById = Object.fromEntries(categories.map(c => [c.id, c]))

  const scoredActivities = activities.filter(a => a.scoreEnabled)

  function userScore(userId: string, month?: string) {
    return scoredActivities
      .filter(a => a.userId === userId)
      .flatMap(a => a.history
        .filter(h => h.score && (!month || monthKey(h.date) === month))
        .map(h => h.score ?? 0))
      .reduce((sum, s) => sum + s, 0)
  }

  function activityScore(a: Activity, month?: string) {
    return a.history
      .filter(h => h.score && (!month || monthKey(h.date) === month))
      .reduce((sum, h) => sum + (h.score ?? 0), 0)
  }

  const allUserIds = [...new Set(scoredActivities.map(a => a.userId))]

  const allTimeUsers = allUserIds
    .map(uid => ({ uid, score: userScore(uid) }))
    .filter(x => x.score > 0).sort((a, b) => b.score - a.score)

  const monthUsers = allUserIds
    .map(uid => ({ uid, score: userScore(uid, selectedMonth) }))
    .filter(x => x.score > 0).sort((a, b) => b.score - a.score)

  const allTimeActivities = scoredActivities
    .map(a => ({ a, score: activityScore(a) }))
    .filter(x => x.score > 0).sort((a, b) => b.score - a.score)

  const monthActivities = scoredActivities
    .map(a => ({ a, score: activityScore(a, selectedMonth) }))
    .filter(x => x.score > 0).sort((a, b) => b.score - a.score)

  const currentMonthKey = monthKey(Date.now())
  const isCurrentMonth = selectedMonth === currentMonthKey

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center px-4 py-3">
          <button className="text-blue-500 text-xl p-1 -ml-1 mr-2" onClick={() => navigate(-1)}>←</button>
          <h1 className="text-xl font-bold flex-1">Scorebord</h1>
        </div>
        <div className="flex border-t border-gray-100">
          {(['gebruikers', 'activiteiten'] as Tab[]).map(t => (
            <button
              key={t}
              className={`flex-1 py-2.5 text-sm font-medium capitalize ${tab === t ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 pb-24 flex flex-col gap-4">
        {tab === 'gebruikers' ? (
          <>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Alltime</p>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {allTimeUsers.length === 0
                  ? <p className="text-sm text-gray-400 p-4">Nog geen scores</p>
                  : allTimeUsers.map((entry, i) => (
                    <div key={entry.uid} className="flex items-center px-4 py-3 border-b border-gray-50 last:border-0">
                      <span className="w-6 text-sm font-bold text-gray-400 mr-3">{i + 1}</span>
                      <span className="flex-1 font-medium text-sm">{usernameById[entry.uid] ?? entry.uid}</span>
                      <span className="text-blue-500 font-bold text-sm">{entry.score} pt</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Per maand</p>
                <div className="flex items-center gap-2">
                  <button className="text-blue-500 px-2" onClick={() => setSelectedMonth(prevMonth(selectedMonth))}>‹</button>
                  <span className="text-sm font-medium text-gray-700 capitalize">{monthLabel(selectedMonth)}</span>
                  <button
                    className={`text-blue-500 px-2 ${isCurrentMonth ? 'opacity-30 pointer-events-none' : ''}`}
                    onClick={() => !isCurrentMonth && setSelectedMonth(nextMonth(selectedMonth))}
                  >›</button>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {monthUsers.length === 0
                  ? <p className="text-sm text-gray-400 p-4">Geen scores in deze maand</p>
                  : monthUsers.map((entry, i) => (
                    <div key={entry.uid} className="flex items-center px-4 py-3 border-b border-gray-50 last:border-0">
                      <span className="w-6 text-sm font-bold text-gray-400 mr-3">{i + 1}</span>
                      <span className="flex-1 font-medium text-sm">{usernameById[entry.uid] ?? entry.uid}</span>
                      <span className="text-blue-500 font-bold text-sm">{entry.score} pt</span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Alltime</p>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {allTimeActivities.length === 0
                  ? <p className="text-sm text-gray-400 p-4">Nog geen scores</p>
                  : allTimeActivities.map(({ a, score }, i) => {
                    const cat = a.categoryId ? categoryById[a.categoryId] : null
                    return (
                      <div key={a.id} className="flex items-center px-4 py-3 border-b border-gray-50 last:border-0">
                        <span className="w-6 text-sm font-bold text-gray-400 mr-3">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{a.name}</p>
                          {cat && <p className="text-xs text-gray-400">{cat.icon} {cat.name}</p>}
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-blue-500 font-bold text-sm">{score} pt</p>
                          <p className="text-xs text-gray-400">{a.scoreLabel || 'score'}</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Per maand</p>
                <div className="flex items-center gap-2">
                  <button className="text-blue-500 px-2" onClick={() => setSelectedMonth(prevMonth(selectedMonth))}>‹</button>
                  <span className="text-sm font-medium text-gray-700 capitalize">{monthLabel(selectedMonth)}</span>
                  <button
                    className={`text-blue-500 px-2 ${isCurrentMonth ? 'opacity-30 pointer-events-none' : ''}`}
                    onClick={() => !isCurrentMonth && setSelectedMonth(nextMonth(selectedMonth))}
                  >›</button>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {monthActivities.length === 0
                  ? <p className="text-sm text-gray-400 p-4">Geen scores in deze maand</p>
                  : monthActivities.map(({ a, score }, i) => {
                    const cat = a.categoryId ? categoryById[a.categoryId] : null
                    return (
                      <div key={a.id} className="flex items-center px-4 py-3 border-b border-gray-50 last:border-0">
                        <span className="w-6 text-sm font-bold text-gray-400 mr-3">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{a.name}</p>
                          {cat && <p className="text-xs text-gray-400">{cat.icon} {cat.name}</p>}
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-blue-500 font-bold text-sm">{score} pt</p>
                          <p className="text-xs text-gray-400">{a.scoreLabel || 'score'}</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
