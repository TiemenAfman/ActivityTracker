import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getActivities, getCategories, getSettings, getUsers, createActivity, createCategory, updateActivity, updateCategory, deleteCategory, logout } from '../api'
import { BottomNav } from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { ActivityCard } from '../components/ActivityCard'
import { CategoryCard } from '../components/CategoryCard'
import { DonePopup } from '../components/DonePopup'
import { AddActivityModal } from '../components/AddActivityModal'
import { AddCategoryModal } from '../components/AddCategoryModal'
import { EditCategoryModal } from '../components/EditCategoryModal'
import { PlusMenu } from '../components/PlusMenu'
import confetti from 'canvas-confetti'
import type { Activity, Category, HistoryEntry, User } from '../types'

export function CategoryPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const currentCategoryId = id

  const [allActivities, setAllActivities] = useState<Activity[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [historyLimit, setHistoryLimit] = useState(10)

  const [doneActivity, setDoneActivity] = useState<Activity | null>(null)
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const refresh = useCallback(() => {
    Promise.all([getActivities(), getCategories(), getSettings(), getUsers()]).then(([acts, cats, settings, usrs]) => {
      setAllActivities(acts)
      setAllCategories(cats)
      setAllUsers(usrs)
      setHistoryLimit(settings.historyLimit ?? 10)
    })
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const currentCategory = currentCategoryId
    ? allCategories.find(c => c.id === currentCategoryId)
    : undefined

  const subCategories = allCategories.filter(c => c.parentId === currentCategoryId)
  const activities = allActivities.filter(
    a => a.categoryId === currentCategoryId && !a.isHidden
  )

  async function handleDone(rating: number, note: string, photo?: string, activity?: Activity, scores?: { userId: string; score: number }[]) {
    const target = activity ?? doneActivity
    if (!target) return
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      date: Date.now(),
      rating,
      scores,
      doneByUserId: user.id,
      note: note || undefined,
      photo,
    }
    const history = [entry, ...target.history].slice(0, historyLimit)
    await updateActivity(target.id, { history })
    setDoneActivity(null)
    refresh()
  }

  async function handleAddActivity(
    name: string,
    interval: number,
    intervalUnit: 'days' | 'weeks',
    categoryId: string | undefined,
    lastDoneDate: string,
    ratingEnabled: boolean,
    scoreEnabled: boolean,
    scoreLabel: string
  ) {
    const history: HistoryEntry[] = lastDoneDate
      ? [{ id: crypto.randomUUID(), date: new Date(lastDoneDate).getTime(), rating: 0 }]
      : []
    await createActivity({ name, interval, intervalUnit, categoryId, history, ratingEnabled, scoreEnabled, scoreLabel, createdAt: Date.now() })
    setShowAddActivity(false)
    refresh()
  }

  async function handleAddCategory(name: string, icon: string, parentId: string | undefined, isPrivate: boolean) {
    await createCategory({ name, icon, parentId, isPrivate, createdAt: Date.now() })
    setShowAddCategory(false)
    refresh()
  }

  async function handleEditCategory(name: string, icon: string, parentId: string | undefined, isPrivate: boolean) {
    if (!editingCategory) return
    await updateCategory(editingCategory.id, { name, icon, parentId, isPrivate })
    setEditingCategory(null)
    refresh()
  }

  async function handleDeleteCategory() {
    if (!editingCategory) return
    const childActivities = allActivities.filter(a => a.categoryId === editingCategory.id)
    await Promise.all(childActivities.map(a =>
      updateActivity(a.id, { categoryId: editingCategory.parentId })
    ))
    const childCategories = allCategories.filter(c => c.parentId === editingCategory.id)
    await Promise.all(childCategories.map(c =>
      updateCategory(c.id, { parentId: editingCategory.parentId })
    ))
    await deleteCategory(editingCategory.id)
    setEditingCategory(null)
    if (currentCategoryId === editingCategory.id) navigate(-1)
    else refresh()
  }

  async function handleResetHidden() {
    const hidden = allActivities.filter(a => a.isHidden && a.userId === user.id)
    await Promise.all(hidden.map(a => updateActivity(a.id, { isHidden: false })))
    refresh()
  }

  async function handleLogout() {
    await logout()
    setUser(null)
  }

  const isEmpty = subCategories.length === 0 && activities.length === 0

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center px-4 py-3 gap-2">
          {currentCategoryId && (
            <button className="text-blue-500 text-xl p-1 -ml-1" onClick={() => navigate(-1)}>←</button>
          )}
          <h1 className="text-xl font-bold flex-1 truncate">
            {currentCategory ? `${currentCategory.icon} ${currentCategory.name}` : 'Activiteiten'}
          </h1>
          {!currentCategoryId && (
            <div className="flex items-center gap-3">
              <button
                className="text-sm text-gray-400"
                onClick={handleLogout}
              >
                {user.username} · Uitloggen
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pb-36 flex flex-col gap-2">
        {isEmpty ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-sm font-medium">Nog niets hier</p>
            <p className="text-xs mt-1">Tik op + om een activiteit of categorie toe te voegen</p>
          </div>
        ) : (
          <>
            {subCategories.length > 0 && (
              <>
                {activities.length > 0 && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1 mb-1">Categorieën</p>
                )}
                {subCategories.map(cat => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    allCategories={allCategories}
                    allActivities={allActivities}
                    currentUserId={user.id}
                    onEdit={() => setEditingCategory(cat)}
                  />
                ))}
              </>
            )}
            {activities.length > 0 && (
              <>
                {subCategories.length > 0 && (
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2 mb-1">Activiteiten</p>
                )}
                {activities.map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    currentUserId={user.id}
                    onDone={() => {
                      if (activity.ratingEnabled === false && !activity.scoreEnabled) {
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.9 } })
                        handleDone(0, '', undefined, activity)
                      } else {
                        setDoneActivity(activity)
                      }
                    }}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <PlusMenu
        onAddActivity={() => setShowAddActivity(true)}
        onAddCategory={() => setShowAddCategory(true)}
        onResetHidden={handleResetHidden}
      />

      {doneActivity && (
        <DonePopup
          activityName={doneActivity.name}
          ratingEnabled={doneActivity.ratingEnabled !== false}
          scoreEnabled={doneActivity.scoreEnabled === true}
          scoreLabel={doneActivity.scoreLabel ?? ''}
          users={allUsers}
          onClose={() => setDoneActivity(null)}
          onSave={(rating, note, photo, scores) => handleDone(rating, note, photo, undefined, scores)}
        />
      )}

      {showAddActivity && (
        <AddActivityModal
          categories={allCategories}
          defaultCategoryId={currentCategoryId}
          onClose={() => setShowAddActivity(false)}
          onSave={handleAddActivity}
        />
      )}

      {showAddCategory && (
        <AddCategoryModal
          categories={allCategories}
          defaultParentId={currentCategoryId}
          onClose={() => setShowAddCategory(false)}
          onSave={handleAddCategory}
        />
      )}

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          categories={allCategories}
          currentUserId={user.id}
          onClose={() => setEditingCategory(null)}
          onSave={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      <BottomNav />
    </div>
  )
}
