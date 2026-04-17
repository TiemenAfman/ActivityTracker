import { Router } from 'express'
import { randomUUID } from 'crypto'
import db from '../db.js'

const router = Router()

function canAccessActivity(activity, userId) {
  if (activity.userId === userId) return true
  if (!activity.categoryId) return false
  const cat = db.data.categories.find(c => c.id === activity.categoryId)
  return cat && !cat.isPrivate
}

router.get('/', (req, res) => {
  const userId = req.session.userId
  const visible = db.data.activities.filter(a => canAccessActivity(a, userId))
  res.json(visible)
})

router.post('/', async (req, res) => {
  const activity = {
    ...req.body,
    id: randomUUID(),
    userId: req.session.userId,
    createdAt: req.body.createdAt ?? Date.now(),
  }
  db.data.activities.push(activity)
  await db.write()
  res.json({ id: activity.id })
})

router.put('/:id', async (req, res) => {
  const idx = db.data.activities.findIndex(a => a.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  if (!canAccessActivity(db.data.activities[idx], req.session.userId))
    return res.status(403).json({ error: 'Forbidden' })
  db.data.activities[idx] = { ...db.data.activities[idx], ...req.body }
  await db.write()
  res.json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  const activity = db.data.activities.find(a => a.id === req.params.id)
  if (!activity) return res.status(404).json({ error: 'Not found' })
  if (!canAccessActivity(activity, req.session.userId))
    return res.status(403).json({ error: 'Forbidden' })
  // toegang via publieke categorie is voldoende om te verwijderen
  db.data.activities = db.data.activities.filter(a => a.id !== req.params.id)
  await db.write()
  res.json({ ok: true })
})

export default router
