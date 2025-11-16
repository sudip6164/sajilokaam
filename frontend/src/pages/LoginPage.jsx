import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { error: showError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      showError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="card">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl blur-2xl opacity-60"></div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl shadow-2xl shadow-purple-500/50">
                <span className="text-3xl font-black text-white">SK</span>
              </div>
            </div>
            <h1 className="text-5xl font-black mb-3 font-display">
              <span className="gradient-text">Sajilo Kaam</span>
            </h1>
            <p className="text-white/70 font-medium text-lg">Welcome back! Sign in to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-white/90 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white/90 mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-base py-4 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </span>
            </button>
            <p className="text-center text-sm text-white/60">
              Don't have an account?{' '}
              <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-bold transition-colors">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
