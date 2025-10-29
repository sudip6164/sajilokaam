import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState('loading...')

  useEffect(() => {
    fetch('http://localhost:8080/api/health')
      .then((r) => r.text())
      .then((t) => setHealth(t))
      .catch(() => setHealth('down'))
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <h1>Sajilo Kaam</h1>
        <p>Backend health: {health}</p>
      </div>
    </div>
  )
}

export default App
