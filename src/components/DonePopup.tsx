import { useState, useRef } from 'react'
import confetti from 'canvas-confetti'

interface Props {
  activityName: string
  ratingEnabled: boolean
  onClose: () => void
  onSave: (rating: number, note: string, photo?: string) => void
}

export function DonePopup({ activityName, ratingEnabled, onClose, onSave }: Props) {
  const [rating, setRating] = useState(0)
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState<string | undefined>()
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl w-full p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-center mb-1">Hoe was het?</h2>
        <p className="text-gray-500 text-sm text-center mb-5">{activityName}</p>

        {ratingEnabled && (
          <div className="flex justify-center gap-3 mb-4">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                className={`text-3xl ${s <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                onClick={() => setRating(rating === s ? 0 : s)}
              >
                ★
              </button>
            ))}
          </div>
        )}

        <textarea
          className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-3 resize-none"
          rows={3}
          placeholder="Notitie (optioneel)"
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
        />

        {photo ? (
          <div className="relative mb-3">
            <img src={photo} className="w-full h-32 object-cover rounded-xl" alt="foto" />
            <button
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
              onClick={() => setPhoto(undefined)}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            className="w-full border border-dashed border-gray-300 rounded-xl p-3 text-sm text-gray-500 mb-3"
            onClick={() => fileRef.current?.click()}
          >
            + Foto toevoegen
          </button>
        )}

        <button
          className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold"
          onClick={() => { confetti({ particleCount: 100, spread: 70, origin: { y: 0.9 } }); onSave(rating, note, photo) }}
        >
          Opslaan
        </button>
      </div>
    </div>
  )
}
