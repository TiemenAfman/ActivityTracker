import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SettingsModal } from './SettingsModal'

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex">
        <button
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 active:bg-gray-50 ${location.pathname === '/profile' ? 'text-blue-500' : 'text-gray-400'}`}
          onClick={() => navigate('/profile')}
        >
          <span className="text-2xl">🏆</span>
          <span className="text-xs">Scorebord</span>
        </button>
        <button
          className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-gray-400 active:bg-gray-50"
          onClick={() => setShowSettings(true)}
        >
          <span className="text-2xl">⚙️</span>
          <span className="text-xs">Instellingen</span>
        </button>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}
