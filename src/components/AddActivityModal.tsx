import { useState } from 'react'
import type { Category } from '../types'

interface Props {
  categories: Category[]
  defaultCategoryId?: string
  onClose: () => void
  onSave: (name: string, interval: number, intervalUnit: 'days' | 'weeks', categoryId: string | undefined, lastDoneDate: string, ratingEnabled: boolean, scoreEnabled: boolean, scoreLabel: string) => void
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className={`w-12 h-6 rounded-full cursor-pointer transition-colors shrink-0 ${value ? 'bg-blue-500' : 'bg-gray-300'}`}
      onClick={() => onChange(!value)}
    >
      <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  )
}

export function AddActivityModal({ categories, defaultCategoryId, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [interval, setInterval] = useState(1)
  const [intervalUnit, setIntervalUnit] = useState<'days' | 'weeks'>('weeks')
  const [categoryId, setCategoryId] = useState(defaultCategoryId ?? '')
  const [lastDone, setLastDone] = useState('')
  const [ratingEnabled, setRatingEnabled] = useState(true)
  const [scoreEnabled, setScoreEnabled] = useState(false)
  const [scoreLabel, setScoreLabel] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full p-6 pb-10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-4">Activiteit toevoegen</h2>

        <label className="block text-sm text-gray-600 mb-1">Naam</label>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-3 text-sm"
          placeholder="Naam activiteit"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />

        <label className="block text-sm text-gray-600 mb-1">Interval</label>
        <div className="flex gap-2 mb-3">
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

        <label className="block text-sm text-gray-600 mb-1">Categorie</label>
        <select
          className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-3 text-sm bg-white"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
        >
          <option value="">— Geen categorie —</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>

        <label className="block text-sm text-gray-600 mb-1">Laatste keer gedaan (optioneel)</label>
        <input
          type="date"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-3 text-sm"
          value={lastDone}
          onChange={e => setLastDone(e.target.value)}
          max={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
        />

        <div className="flex items-center justify-between mb-3 py-2">
          <div>
            <p className="text-sm text-gray-700 font-medium">Beoordeling</p>
            <p className="text-xs text-gray-400">Sterren vragen bij voltooiing</p>
          </div>
          <Toggle value={ratingEnabled} onChange={setRatingEnabled} />
        </div>

        <div className="flex items-center justify-between mb-3 py-2">
          <div>
            <p className="text-sm text-gray-700 font-medium">Score</p>
            <p className="text-xs text-gray-400">Punten bijhouden</p>
          </div>
          <Toggle value={scoreEnabled} onChange={setScoreEnabled} />
        </div>

        {scoreEnabled && (
          <>
            <label className="block text-sm text-gray-600 mb-1">Scorenaam</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-4 text-sm"
              placeholder="bijv. uitgevoerd, betaald, gepland"
              value={scoreLabel}
              onChange={e => setScoreLabel(e.target.value)}
            />
          </>
        )}

        <button
          disabled={!name.trim()}
          className="w-full bg-blue-500 disabled:bg-gray-300 text-white rounded-xl py-3 font-semibold"
          onClick={() => name.trim() && onSave(name.trim(), interval, intervalUnit, categoryId || undefined, lastDone, ratingEnabled, scoreEnabled, scoreLabel)}
        >
          Toevoegen
        </button>
      </div>
    </div>
  )
}
