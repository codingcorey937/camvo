import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api, getToken, setToken, clearToken } from '../api/client'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string, phone?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(getToken())
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const t = getToken()
    if (t) {
      setTokenState(t)
      api.getMe(t)
        .then((u) => setUser({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          phone: u.phone,
        }))
        .catch(() => {
          clearToken()
          setTokenState(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password)
    setToken(res.token)
    setTokenState(res.token)
    setUser({
      id: res.user.id,
      email: res.user.email,
      fullName: res.user.fullName,
      phone: res.user.phone,
    })
  }, [])

  const signup = useCallback(async (email: string, password: string, fullName: string, phone?: string) => {
    const res = await api.signup(email, password, fullName, phone)
    setToken(res.token)
    setTokenState(res.token)
    setUser({
      id: res.user.id,
      email: res.user.email,
      fullName: res.user.fullName,
      phone: res.user.phone,
    })
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}