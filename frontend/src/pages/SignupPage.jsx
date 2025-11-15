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
      // Auto-login with the token from registration
      localStorage.setItem('token', data.token)
      // Update auth context
      window.location.href = '/' // Force reload to update auth state
      showSuccess('Account created successfully!')
    } catch (err) {
      showError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card backdrop-blur-xl bg-white/95 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <span className="text-2xl font-bold text-white">SK</span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600 font-medium">Join Sajilo Kaam and start freelancing</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('FREELANCER')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    role === 'FREELANCER'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  disabled={loading}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">👨‍💻</div>
                    <div className="text-sm font-bold">Freelancer</div>
                    <div className="text-xs text-gray-500 mt-1">Looking for work</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('CLIENT')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    role === 'CLIENT'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  disabled={loading}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">💼</div>
                    <div className="text-sm font-bold">Client</div>
                    <div className="text-xs text-gray-500 mt-1">Hiring talent</div>
                  </div>
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-base py-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

