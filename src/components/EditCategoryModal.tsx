import { useState } from 'react'
import type { Category } from '../types'

interface Props {
  category: Category
  categories: Category[]
  onClose: () => void
  onSave: (name: string, icon: string, parentId: string | undefined, isPrivate: boolean) => void
  onDelete: () => void
  currentUserId: string
}

const ICONS = ['🏃', '🏋️', '🧘', '🚴', '🏊', '🎯', '📚', '🎵', '🌿', '🍎',
               '💊', '🛁', '🏠', '💼', '❤️', '🎮', '🌍', '🐾', '🎨', '🔧',
               '⚽', '🎸', '✈️', '🍳', '🧹', '💪', '🧠', '🌸', '☕', '📋']

export function EditCategoryModal({ category, categories, onClose, onSave, onDelete, currentUserId }: Props) {
  const [name, setName] = useState(category.name)
  const [icon, setIcon] = useState(category.icon)
  const [parentId, setParentId] = useState(category.parentId ?? '')
  const [isPrivate, setIsPrivate] = useState(category.isPrivate)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isOwner = category.userId === currentUserId

  const validParents = categories.filter(c => c.id !== category.id)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full p-6 pb-10" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-4">Categorie bewerken</h2>

        <label className="block text-sm text-gray-600 mb-1">Naam</label>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-3 text-sm"
          value={name}
          onChange={e => setName(e.target.value)}
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
          value={icon}
          onChange={e => setIcon(e.target.value || '📁')}
          maxLength={4}
        />

        <label className="block text-sm text-gray-600 mb-1">Onderdeel van</label>
        <select
          className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-5 text-sm bg-white"
          value={parentId}
          onChange={e => setParentId(e.target.value)}
        >
          <option value="">— Hoofd categorie —</option>
          {validParents.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>

        {isOwner && (
          <div className="flex items-center justify-between mb-3 py-1">
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
        )}

        <button
          disabled={!name.trim()}
          className="w-full bg-blue-500 disabled:bg-gray-300 text-white rounded-xl py-3 font-semibold mb-3"
          onClick={() => name.trim() && onSave(name.trim(), icon, parentId || undefined, isPrivate)}
        >
          Opslaan
        </button>

        {confirmDelete ? (
          <div className="flex gap-2">
            <button
              className="flex-1 bg-red-500 text-white rounded-xl py-2.5 font-medium text-sm"
              onClick={onDelete}
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
        ) : isOwner ? (
          <button
            className="w-full text-red-500 font-medium text-sm py-2"
            onClick={() => setConfirmDelete(true)}
          >
            Categorie verwijderen
          </button>
        ) : null}
      </div>
    </div>
  )
}
