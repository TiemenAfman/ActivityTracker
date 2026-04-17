import { createContext, useContext } from 'react'
import type { User } from '../types'

interface AuthCtx {
  user: User
  setUser: (u: User | null) => void
}

export const AuthContext = createContext<AuthCtx | null>(null)

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthContext.Provider')
  return ctx
}
