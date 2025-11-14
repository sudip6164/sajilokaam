import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadProfile = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else {
        logout()
      }
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

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
    setToken(data.token)
    localStorage.setItem('token', data.token)
    await loadProfile()
  }

  const logout = () => {
    setToken('')
    setProfile(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ token, profile, login, logout, loading }}>
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

