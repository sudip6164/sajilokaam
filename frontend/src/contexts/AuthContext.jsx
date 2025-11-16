import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (tokenToUse = null) => {
    const authToken = tokenToUse || token
    if (!authToken) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else {
        // Token is invalid, clear it
        setToken('')
        setProfile(null)
        localStorage.removeItem('token')
      }
    } catch (err) {
      // Network error or invalid token - don't block the app
      console.warn('Failed to load profile:', err)
      setToken('')
      setProfile(null)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      loadProfile()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const login = async (email, password) => {
    const res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) {
      throw new Error(res.status === 401 ? 'Invalid email or password' : 'Login failed')
    }
    const data = await res.json()
    const newToken = data.token
    setToken(newToken)
    localStorage.setItem('token', newToken)
    // Pass the new token directly to loadProfile
    await loadProfile(newToken)
  }

  const logout = () => {
    setToken('')
    setProfile(null)
    localStorage.removeItem('token')
    setLoading(false)
  }

  const refreshProfile = useCallback(async () => {
    if (token) {
      await loadProfile()
    }
  }, [token, loadProfile])

  return (
    <AuthContext.Provider value={{ token, profile, login, logout, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

