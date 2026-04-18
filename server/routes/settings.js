import { Router } from 'express'
import { loadSettings, saveSettings } from '../settings.js'
import { runBackup } from '../backup.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(loadSettings())
})

router.put('/', (req, res) => {
  const current = loadSettings()
  const updated = { ...current, ...req.body }
  saveSettings(updated)
  res.json(updated)
})

router.post('/backup-now', (_req, res) => {
  const result = runBackup()
  if (!result.ok) return res.status(400).json({ error: result.error })
  res.json(result)
})

router.post('/restart', (_req, res) => {
  res.json({ ok: true })
  setTimeout(() => process.exit(0), 500)
})

export default router
