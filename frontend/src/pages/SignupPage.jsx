import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

export function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('FREELANCER')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      showError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role })
      })

      if (res.status === 409) {
        showError('Email already registered')
        return
      }

      if (!res.ok) {
        throw new Error('Registration failed')
      }

      const data = await res.json()
      localStorage.setItem('token', data.token)
      window.location.href = '/'
      showSuccess('Account created successfully!')
    } catch (err) {
      showError(err.message || 'Registration failed')
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
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
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
              <span className="gradient-text">Create Account</span>
            </h1>
            <p className="text-white/70 font-medium text-lg">Join Sajilo Kaam and start freelancing</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-white/90 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="input-field"
                disabled={loading}
              />
            </div>
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-field"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white/90 mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="input-field"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white/90 mb-3">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('FREELANCER')}
                  className={`p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                    role === 'FREELANCER'
                      ? 'border-violet-500 bg-violet-500/20 text-white shadow-lg shadow-violet-500/30'
                      : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10'
                  }`}
                  disabled={loading}
                >
                  {role === 'FREELANCER' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20"></div>
                  )}
                  <div className="relative text-center">
                    <div className="text-3xl mb-2">👨‍💻</div>
                    <div className="text-sm font-bold">Freelancer</div>
                    <div className="text-xs text-white/60 mt-1">Looking for work</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('CLIENT')}
                  className={`p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                    role === 'CLIENT'
                      ? 'border-violet-500 bg-violet-500/20 text-white shadow-lg shadow-violet-500/30'
                      : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10'
                  }`}
                  disabled={loading}
                >
                  {role === 'CLIENT' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20"></div>
                  )}
                  <div className="relative text-center">
                    <div className="text-3xl mb-2">💼</div>
                    <div className="text-sm font-bold">Client</div>
                    <div className="text-xs text-white/60 mt-1">Hiring talent</div>
                  </div>
                </button>
              </div>
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </span>
            </button>
            <p className="text-center text-sm text-white/60">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
