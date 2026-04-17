import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getActivities, getCategories, updateActivity, deleteActivity } from '../api'
import { useAuth } from '../context/AuthContext'
import { PhotoViewer } from '../components/PhotoViewer'
import { calendarDaysSince, formatDate } from '../utils/time'
import type { Activity, Category } from '../types'

export function EditActivityPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [activity, setActivity] = useState<Activity | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])

  const [name, setName] = useState('')
  const [interval, setInterval] = useState(1)
  const [intervalUnit, setIntervalUnit] = useState<'days' | 'weeks'>('weeks')
  const [categoryId, setCategoryId] = useState('')
  const [lastDate, setLastDate] = useState('')
  const [ratingEnabled, setRatingEnabled] = useState(true)

  const [viewPhoto, setViewPhoto] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteHistoryId, setDeleteHistoryId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getActivities(), getCategories()]).then(([acts, cats]) => {
      const found = acts.find(a => a.id === id)
      if (found) {
        setActivity(found)
        setName(found.name)
        setInterval(found.interval ?? found.intervalWeeks ?? 1)
        setIntervalUnit(found.intervalUnit ?? 'weeks')
        setCategoryId(found.categoryId ?? '')
        setRatingEnabled(found.ratingEnabled !== false)
        const latest = [...found.history].sort((a, b) => b.date - a.date)[0]
        if (latest) setLastDate(new Date(latest.date).toISOString().split('T')[0])
      }
      setAllCategories(cats)
    })
  }, [id])

  async function handleSave() {
    if (!activity) return
    const updates: Partial<Activity> = {
      name: name.trim() || activity.name,
      interval,
      intervalUnit,
      categoryId: categoryId || undefined,
      ratingEnabled,
    }
    if (lastDate) {
      const newTs = new Date(lastDate).getTime()
      const sorted = [...activity.history].sort((a, b) => b.date - a.date)
      if (sorted.length > 0 && sorted[0].date !== newTs) {
        updates.history = activity.history.map(h =>
          h.id === sorted[0].id ? { ...h, date: newTs } : h
        )
      } else if (sorted.length === 0) {
        updates.history = [{ id: crypto.randomUUID(), date: newTs, rating: 0 }]
      }
    }
    await updateActivity(activity.id, updates)
    navigate(-1)
  }

  async function handleDeleteActivity() {
    if (!activity) return
    await deleteActivity(activity.id)
    navigate(-1)
  }

  async function handleDeleteHistoryEntry(entryId: string) {
    if (!activity) return
    const history = activity.history.filter(h => h.id !== entryId)
    await updateActivity(activity.id, { history })
    setActivity({ ...activity, history })
    setDeleteHistoryId(null)
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400">Laden...</p>
      </div>
    )
  }

  const sortedHistory = [...activity.history].sort((a, b) => b.date - a.date)

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center px-4 py-3">
          <button className="text-blue-500 text-xl p-1 -ml-1 mr-2" onClick={() => navigate(-1)}>←</button>
          <h1 className="text-xl font-bold flex-1 truncate">Activiteit bewerken</h1>
          <button className="text-blue-500 font-semibold" onClick={handleSave}>Opslaan</button>
        </div>
      </div>

      <div className="p-4 pb-24 flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Naam</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Interval</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={365}
                inputMode="numeric"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                value={interval}
                onChange={e => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <select
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                value={intervalUnit}
                onChange={e => setIntervalUnit(e.target.value as 'days' | 'weeks')}
              >
                <option value="days">Dagen</option>
                <option value="weeks">Weken</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Categorie</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">— Geen categorie —</option>
              {allCategories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm text-gray-700 font-medium">Beoordeling</p>
              <p className="text-xs text-gray-400">Sterren vragen bij voltooiing</p>
            </div>
            <div
              className={`w-12 h-6 rounded-full cursor-pointer transition-colors shrink-0 ${ratingEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
              onClick={() => setRatingEnabled(!ratingEnabled)}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${ratingEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Laatste voltooiingsdatum</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              value={lastDate}
              onChange={e => setLastDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {sortedHistory.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Geschiedenis</p>
            <div className="flex flex-col gap-2">
              {sortedHistory.map(entry => (
                <div key={entry.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{formatDate(entry.date)}</p>
                      <p className="text-xs text-gray-400">
                        {calendarDaysSince(entry.date) === 0 ? 'Vandaag' :
                         calendarDaysSince(entry.date) === 1 ? 'Gisteren' :
                         `${calendarDaysSince(entry.date)} dagen geleden`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.rating > 0 && (
                        <span className="text-yellow-400 text-sm">
                          {'★'.repeat(entry.rating)}{'☆'.repeat(5 - entry.rating)}
                        </span>
                      )}
                      <button
                        className="text-red-400 text-base px-1"
                        onClick={() => setDeleteHistoryId(
                          deleteHistoryId === entry.id ? null : entry.id
                        )}
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  {entry.note && (
                    <p className="text-sm text-gray-600 mt-2">{entry.note}</p>
                  )}

                  {entry.photo && (
                    <img
                      src={entry.photo}
                      className="w-full h-28 object-cover rounded-lg mt-2 cursor-pointer"
                      alt="foto"
                      onClick={() => setViewPhoto(entry.photo!)}
                    />
                  )}

                  {deleteHistoryId === entry.id && (
                    <div className="flex gap-2 mt-3">
                      <button
                        className="flex-1 bg-red-500 text-white rounded-lg py-1.5 text-sm font-medium"
                        onClick={() => handleDeleteHistoryEntry(entry.id)}
                      >
                        Verwijderen
                      </button>
                      <button
                        className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-1.5 text-sm font-medium"
                        onClick={() => setDeleteHistoryId(null)}
                      >
                        Annuleren
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm">
            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-red-500 text-white rounded-xl py-2.5 font-medium text-sm"
                  onClick={handleDeleteActivity}
                >
                  Ja, verwijderen
                </button>
                <button
                  className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2.5 font-medium text-sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Annuleren
                </button>
              </div>
            ) : (
              <button
                className="w-full text-red-500 font-medium text-sm py-1"
                onClick={() => setConfirmDelete(true)}
              >
                Activiteit verwijderen
              </button>
            )}
          </div>
      </div>

      {viewPhoto && <PhotoViewer src={viewPhoto} onClose={() => setViewPhoto(null)} />}
    </div>
  )
}
