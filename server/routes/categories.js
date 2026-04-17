import { Router } from 'express'
import { randomUUID } from 'crypto'
import db from '../db.js'

const router = Router()

function canAccessCategory(category, userId) {
  return category.userId === userId || !category.isPrivate
}

router.get('/', (req, res) => {
  const userId = req.session.userId
  res.json(db.data.categories.filter(c => canAccessCategory(c, userId)))
})

router.post('/', async (req, res) => {
  const category = {
    ...req.body,
    id: randomUUID(),
    userId: req.session.userId,
    createdAt: req.body.createdAt ?? Date.now(),
  }
  db.data.categories.push(category)
  await db.write()
  res.json({ id: category.id })
})

router.put('/:id', async (req, res) => {
  const idx = db.data.categories.findIndex(c => c.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  if (!canAccessCategory(db.data.categories[idx], req.session.userId))
    return res.status(403).json({ error: 'Forbidden' })
  db.data.categories[idx] = { ...db.data.categories[idx], ...req.body }
  await db.write()
  res.json({ ok: true })
})

router.delete('/:id', async (req, res) => {
  const category = db.data.categories.find(c => c.id === req.params.id)
  if (!category) return res.status(404).json({ error: 'Not found' })
  // Alleen eigenaar mag categorie verwijderen
  if (category.userId !== req.session.userId)
    return res.status(403).json({ error: 'Forbidden' })
  db.data.categories = db.data.categories.filter(c => c.id !== req.params.id)
  await db.write()
  res.json({ ok: true })
})

export default router
