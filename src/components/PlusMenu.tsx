import { useState } from 'react'

interface Props {
  onAddActivity: () => void
  onAddCategory: () => void
  onResetHidden: () => void
}

export function PlusMenu({ onAddActivity, onAddCategory, onResetHidden }: Props) {
  const [open, setOpen] = useState(false)

  function action(fn: () => void) {
    setOpen(false)
    fn()
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {open && (
          <div className="flex flex-col items-end gap-2 mb-1">
            <button
              className="bg-white shadow-lg rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
              onClick={() => action(onAddActivity)}
            >
              📋 Activiteit
            </button>
            <button
              className="bg-white shadow-lg rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
              onClick={() => action(onAddCategory)}
            >
              📁 Categorie
            </button>
            <button
              className="bg-white shadow-lg rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800"
              onClick={() => action(onResetHidden)}
            >
              👁 Reset verborgen activiteiten
            </button>
          </div>
        )}
        <button
          className="w-14 h-14 rounded-full bg-blue-500 text-white text-2xl shadow-lg flex items-center justify-center active:bg-blue-600"
          onClick={() => setOpen(!open)}
        >
          {open ? '✕' : '+'}
        </button>
      </div>
    </>
  )
}
