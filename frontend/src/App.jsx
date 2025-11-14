import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState('loading...')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch('http://localhost:8080/api/health')
      .then((r) => r.text())
      .then((t) => setHealth(t))
      .catch(() => setHealth('down'))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setProfile(null)
    setToken('')
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        const statusText = res.status === 401 ? 'Invalid email or password' : `Login failed (${res.status})`
        setError(statusText)
        return
      }
      const data = await res.json()
      setToken(data.token || '')
      await loadProfile(data.token)
    } catch (err) {
      setError(`Error: ${err.message}`)
    }
  }

  const loadProfile = async (tokenValue) => {
    try {
      const res = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${tokenValue}`
        }
      })
      if (!res.ok) {
        throw new Error('Failed to fetch profile')
      }
      const data = await res.json()
      setProfile(data)
    } catch (err) {
      setError('Failed to fetch profile')
    }
  }

  const loadUsers = async () => {
    setError('')
    try {
      const res = await fetch('http://localhost:8080/api/users')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load users')
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '90vw', maxWidth: 420 }}>
        <h1>Sajilo Kaam</h1>
        <p>Backend health: {health}</p>

        <form onSubmit={submit} style={{ marginTop: 16, display: 'grid', gap: 8 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {token && (
          <div style={{ marginTop: 12 }}>
            <p>Token:</p>
            <code style={{ wordBreak: 'break-all' }}>{token}</code>
            {profile && (
              <div style={{ marginTop: 8 }}>
                <p>Logged in as</p>
                <strong>{profile.fullName}</strong>
                <div>{profile.email}</div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button type="button" onClick={loadUsers}>Load users</button>
          <ul>
            {users.map(u => (
              <li key={u.id}>{u.fullName} ({u.email})</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
