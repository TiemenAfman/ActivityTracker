import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadSettings, saveSettings } from './settings.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', 'data')

function isDue(lastBackup, interval) {
  if (!lastBackup) return true
  const last = new Date(lastBackup)
  const now = new Date()
  const diffDays = (now - last) / 86400000
  if (interval === 'daily') return diffDays >= 1
  if (interval === 'weekly') return diffDays >= 7
  if (interval === 'monthly') return diffDays >= 30
  return false
}

export function runBackup() {
  const settings = loadSettings()
  const { enabled, location, interval } = settings.backup
  if (!enabled || !location) return { ok: false, error: 'Backup niet ingeschakeld of geen locatie ingesteld' }
  if (!existsSync(location)) {
    try { mkdirSync(location, { recursive: true }) } catch {
      return { ok: false, error: `Locatie bestaat niet en kon niet aangemaakt worden: ${location}` }
    }
  }

  const date = new Date().toISOString().split('T')[0]
  const dest = join(location, `backup-${date}`)
  mkdirSync(dest, { recursive: true })

  const files = ['activities.json', 'users.json', 'settings.json']
  for (const file of files) {
    const src = join(dataDir, file)
    if (existsSync(src)) copyFileSync(src, join(dest, file))
  }

  settings.backup.lastBackup = new Date().toISOString()
  saveSettings(settings)
  console.log(`Backup gemaakt: ${dest}`)
  return { ok: true, path: dest, timestamp: settings.backup.lastBackup }
}

let timer = null

export function scheduleBackup() {
  if (timer) clearInterval(timer)
  // elk uur controleren of backup nodig is
  timer = setInterval(() => {
    const settings = loadSettings()
    const { enabled, interval, lastBackup } = settings.backup
    if (enabled && isDue(lastBackup, interval)) runBackup()
  }, 60 * 60 * 1000)
}
