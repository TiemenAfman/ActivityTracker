import { useState, useEffect } from 'react'
import { login, setup, checkSetupNeeded } from '../api'
import type { User } from '../types'

interface Props {
  onSuccess: (user: User) => void
}

export function LoginPage({ onSuccess }: Props) {
  const [isSetup, setIsSetup] = useState<boolean | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkSetupNeeded().then(r => setIsSetup(r.needed))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) return
    if (isSetup && password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }
    setLoading(true)
    setError('')
    try {
      const user = isSetup ? await setup(username, password) : await login(username, password)
      onSuccess(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout')
    } finally {
      setLoading(false)
    }
  }

  if (isSetup === null) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📋</div>
          <h1 className="text-2xl font-bold text-gray-900">Activiteiten Tracker</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4 text-gray-700">
            {isSetup ? 'Eerste gebruiker aanmaken' : 'Inloggen'}
          </h2>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-3 mb-3 text-sm"
            placeholder="Gebruikersnaam"
            value={username}
            onChange={e => { setUsername(e.target.value); setError('') }}
            autoCapitalize="none"
            autoCorrect="off"
            autoFocus
          />
          <input
            type="password"
            className="w-full border border-gray-200 rounded-xl px-3 py-3 mb-3 text-sm"
            placeholder="Wachtwoord"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
          />
          {isSetup && (
            <input
              type="password"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 mb-3 text-sm"
              placeholder="Bevestig wachtwoord"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError('') }}
            />
          )}
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-blue-500 disabled:bg-gray-300 text-white rounded-xl py-3 font-semibold"
          >
            {loading ? 'Bezig...' : isSetup ? 'Aanmaken' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  )
}
