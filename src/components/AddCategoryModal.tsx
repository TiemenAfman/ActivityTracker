import { useState } from 'react'
import type { Category } from '../types'

interface Props {
  categories: Category[]
  defaultParentId?: string
  onClose: () => void
  onSave: (name: string, icon: string, parentId: string | undefined, isPrivate: boolean) => void
}

const ICONS = ['🏃', '🏋️', '🧘', '🚴', '🏊', '🎯', '📚', '🎵', '🌿', '🍎',
               '💊', '🛁', '🏠', '💼', '❤️', '🎮', '🌍', '🐾', '🎨', '🔧',
               '⚽', '🎸', '✈️', '🍳', '🧹', '💪', '🧠', '🌸', '☕', '📋']

export function AddCategoryModal({ categories, defaultParentId, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📁')
  const [parentId, setParentId] = useState(defaultParentId ?? '')
  const [isPrivate, setIsPrivate] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full p-6 pb-10" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-4">Categorie toevoegen</h2>

        <label className="block text-sm text-gray-600 mb-1">Naam</label>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-3 text-sm"
          placeholder="Naam categorie"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />

        <label className="block text-sm text-gray-600 mb-2">Icoon</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {ICONS.map(i => (
            <button
              key={i}
              className={`text-2xl p-1 rounded-lg ${icon === i ? 'bg-blue-100 ring-2 ring-blue-400' : ''}`}
              onClick={() => setIcon(i)}
            >
              {i}
            </button>
          ))}
        </div>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-3 text-sm"
          placeholder="Of typ een emoji..."
          value={icon}
          onChange={e => setIcon(e.target.value || '📁')}
          maxLength={4}
        />

        <label className="block text-sm text-gray-600 mb-1">Onderdeel van (optioneel)</label>
        <select
          className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-5 text-sm bg-white"
          value={parentId}
          onChange={e => setParentId(e.target.value)}
        >
          <option value="">— Hoofd categorie —</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>

        <div className="flex items-center justify-between mb-5 py-1">
          <div>
            <p className="text-sm text-gray-700 font-medium">Privé</p>
            <p className="text-xs text-gray-400">Alleen voor jou zichtbaar</p>
          </div>
          <div
            className={`w-12 h-6 rounded-full cursor-pointer transition-colors shrink-0 ${isPrivate ? 'bg-blue-500' : 'bg-gray-300'}`}
            onClick={() => setIsPrivate(!isPrivate)}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>

        <button
          disabled={!name.trim()}
          className="w-full bg-blue-500 disabled:bg-gray-300 text-white rounded-xl py-3 font-semibold"
          onClick={() => name.trim() && onSave(name.trim(), icon, parentId || undefined, isPrivate)}
        >
          Toevoegen
        </button>
      </div>
    </div>
  )
}
