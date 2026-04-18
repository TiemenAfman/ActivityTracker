import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { CategoryPage } from './pages/CategoryPage'
import { EditActivityPage } from './pages/EditActivityPage'
import { ProfilePage } from './pages/ProfilePage'
import { AuthContext } from './context/AuthContext'
import { getMe } from './api'
import type { User } from './types'

export default function App() {
  const [user, setUser] = useState<User | null | 'loading'>('loading')

  useEffect(() => {
    getMe()
      .then(u => setUser(u))
      .catch(() => setUser(null))
  }, [])

  if (user === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Laden...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onSuccess={u => setUser(u)} />
  }

  return (
    <AuthContext.Provider value={{ user, setUser: u => setUser(u) }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CategoryPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/activity/:id/edit" element={<EditActivityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
