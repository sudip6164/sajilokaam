import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState('loading...')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
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
    setToken('')
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        throw new Error('Login failed')
      }
      const data = await res.json()
      setToken(data.token || '')
    } catch (err) {
      setError('Login failed')
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
