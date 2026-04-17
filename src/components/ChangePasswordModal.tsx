import { useState } from 'react'
import { changePassword, changeUsername } from '../api'
import { useAuth } from '../context/AuthContext'

interface Props {
  onClose: () => void
}

type Tab = 'username' | 'password'

export function ChangePasswordModal({ onClose }: Props) {
  const { user, setUser } = useAuth()
  const [tab, setTab] = useState<Tab>('password')

  // wachtwoord
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  // gebruikersnaam
  const [newUsername, setNewUsername] = useState(user.username)
  const [pwForUsername, setPwForUsername] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function reset() {
    setError(''); setSuccess('')
    setCurrent(''); setNext(''); setConfirm('')
    setPwForUsername('')
  }

  async function handlePasswordSave() {
    if (!current || !next) { setError('Vul alle velden in'); return }
    if (next !== confirm) { setError('Nieuwe wachtwoorden komen niet overeen'); return }
    setLoading(true); setError('')
    try {
      await changePassword(current, next)
      setSuccess('Wachtwoord gewijzigd')
      setCurrent(''); setNext(''); setConfirm('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fout')
    } finally { setLoading(false) }
  }

  async function handleUsernameSave() {
    if (!newUsername.trim()) { setError('Vul een gebruikersnaam in'); return }
    if (!pwForUsername) { setError('Vul je wachtwoord in ter bevestiging'); return }
    setLoading(true); setError('')
    try {
      const result = await changeUsername(newUsername.trim(), pwForUsername)
      setUser({ ...user, username: result.username })
      setSuccess('Gebruikersnaam gewijzigd')
      setPwForUsername('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fout')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full p-6 pb-10" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-4">Account</h2>

        <div className="flex gap-2 mb-5">
          {(['password', 'username'] as Tab[]).map(t => (
            <button
              key={t}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => { setTab(t); reset() }}
            >
              {t === 'password' ? 'Wachtwoord' : 'Gebruikersnaam'}
            </button>
          ))}
        </div>

        {success ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium mb-4">{success} ✓</p>
            <button className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold" onClick={onClose}>
              Sluiten
            </button>
          </div>
        ) : tab === 'password' ? (
          <>
            <label className="block text-sm text-gray-600 mb-1">Huidig wachtwoord</label>
            <input type="password" className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-3 text-sm"
              value={current} onChange={e => { setCurrent(e.target.value); setError('') }} autoFocus />
            <label className="block text-sm text-gray-600 mb-1">Nieuw wachtwoord</label>
            <input type="password" className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-3 text-sm"
              value={next} onChange={e => { setNext(e.target.value); setError('') }} />
            <label className="block text-sm text-gray-600 mb-1">Bevestig nieuw wachtwoord</label>
            <input type="password" className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-4 text-sm"
              value={confirm} onChange={e => { setConfirm(e.target.value); setError('') }} />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button disabled={loading} className="w-full bg-blue-500 disabled:bg-gray-300 text-white rounded-xl py-3 font-semibold"
              onClick={handlePasswordSave}>
              {loading ? 'Bezig...' : 'Opslaan'}
            </button>
          </>
        ) : (
          <>
            <label className="block text-sm text-gray-600 mb-1">Nieuwe gebruikersnaam</label>
            <input className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-3 text-sm"
              value={newUsername} onChange={e => { setNewUsername(e.target.value); setError('') }}
              autoCapitalize="none" autoCorrect="off" autoFocus />
            <label className="block text-sm text-gray-600 mb-1">Wachtwoord ter bevestiging</label>
            <input type="password" className="w-full border border-gray-200 rounded-xl px-3 py-2 mb-4 text-sm"
              value={pwForUsername} onChange={e => { setPwForUsername(e.target.value); setError('') }} />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button disabled={loading} className="w-full bg-blue-500 disabled:bg-gray-300 text-white rounded-xl py-3 font-semibold"
              onClick={handleUsernameSave}>
              {loading ? 'Bezig...' : 'Opslaan'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
