import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as SecureStore from 'expo-secure-store'
import { auth as authApi } from '../services/api'

interface User {
  id: string
  email: string
  fullName: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'camvo_token'
const USER_KEY = 'camvo_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStoredAuth()
  }, [])

  async function loadStoredAuth() {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY)
      const storedUser = await SecureStore.getItemAsync(USER_KEY)
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.error('Failed to load stored auth:', e)
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const result = await authApi.login(email, password)
    const userData: User = result.user
    const jwtToken: string = result.token

    await SecureStore.setItemAsync(TOKEN_KEY, jwtToken)
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData))

    setToken(jwtToken)
    setUser(userData)
  }

  async function signup(email: string, password: string, fullName: string, phone?: string) {
    const result = await authApi.signup(email, password, fullName, phone)
    const userData: User = result.user
    const jwtToken: string = result.token

    await SecureStore.setItemAsync(TOKEN_KEY, jwtToken)
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData))

    setToken(jwtToken)
    setUser(userData)
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    await SecureStore.deleteItemAsync(USER_KEY)
    setToken(null)
    setUser(null)
  }

  async function refreshUser() {
    if (!token) return
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()
      setUser(result)
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result))
    } catch (e) {
      console.error('Failed to refresh user:', e)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}