import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const settingsFile = join(__dirname, '..', 'data', 'settings.json')

const defaults = {
  backup: {
    enabled: false,
    location: '',
    interval: 'weekly', // 'daily' | 'weekly' | 'monthly'
    lastBackup: null,
  },
}

export function loadSettings() {
  try {
    return { ...defaults, ...JSON.parse(readFileSync(settingsFile, 'utf8')) }
  } catch {
    return { ...defaults }
  }
}

export function saveSettings(settings) {
  writeFileSync(settingsFile, JSON.stringify(settings, null, 2))
}
