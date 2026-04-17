import { useState, useEffect } from 'react'
import { getSettings, saveSettings, backupNow } from '../api'
import type { Settings } from '../api'

interface Props {
  onClose: () => void
}

export function SettingsModal({ onClose }: Props) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [backupMsg, setBackupMsg] = useState('')
  const [backupError, setBackupError] = useState('')

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    await saveSettings(settings)
    setSaving(false)
  }

  async function handleBackupNow() {
    setBackupMsg('')
    setBackupError('')
    try {
      const result = await backupNow()
      setBackupMsg(`Backup gemaakt op ${new Date(result.timestamp).toLocaleString('nl-NL')}`)
    } catch (e) {
      setBackupError(e instanceof Error ? e.message : 'Fout bij backup')
    }
  }

  function update(patch: Partial<Settings['backup']>) {
    if (!settings) return
    setSettings({ ...settings, backup: { ...settings.backup, ...patch } })
  }

  if (!settings) return null

  const { backup } = settings

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full p-6 pb-10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-5">Instellingen</h2>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Backup</p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-700 font-medium">Automatische backup</p>
            <p className="text-xs text-gray-400">Kopieert data naar opgegeven locatie</p>
          </div>
          <div
            className={`w-12 h-6 rounded-full cursor-pointer transition-colors shrink-0 ${backup.enabled ? 'bg-blue-500' : 'bg-gray-300'}`}
            onClick={() => update({ enabled: !backup.enabled })}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${backup.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>

        {backup.enabled && (
          <>
            <label className="block text-sm text-gray-600 mb-1">Backup locatie</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-3 text-sm font-mono"
              placeholder="bijv. D:\Backups\Activiteiten"
              value={backup.location}
              onChange={e => update({ location: e.target.value })}
            />

            <label className="block text-sm text-gray-600 mb-1">Interval</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-4 text-sm bg-white"
              value={backup.interval}
              onChange={e => update({ interval: e.target.value as 'daily' | 'weekly' | 'monthly' })}
            >
              <option value="daily">Dagelijks</option>
              <option value="weekly">Wekelijks</option>
              <option value="monthly">Maandelijks</option>
            </select>
          </>
        )}

        {backup.lastBackup && (
          <p className="text-xs text-gray-400 mb-4">
            Laatste backup: {new Date(backup.lastBackup).toLocaleString('nl-NL')}
          </p>
        )}

        {backupMsg && <p className="text-green-600 text-sm mb-3">{backupMsg}</p>}
        {backupError && <p className="text-red-500 text-sm mb-3">{backupError}</p>}

        <button
          className="w-full border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 mb-3"
          onClick={handleBackupNow}
        >
          Nu backuppen
        </button>

        <button
          disabled={saving}
          className="w-full bg-blue-500 disabled:bg-gray-300 text-white rounded-xl py-3 font-semibold"
          onClick={handleSave}
        >
          {saving ? 'Opslaan...' : 'Opslaan'}
        </button>
      </div>
    </div>
  )
}
