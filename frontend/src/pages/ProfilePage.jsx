import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { gradients } from '../theme/designSystem'

export function ProfilePage() {
  const { profile, token, refreshProfile } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '')
    }
  }, [profile])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password && password.length < 6) {
      showError('Password must be at least 6 characters')
      return
    }

    if (password && password !== confirmPassword) {
      showError('Passwords do not match')
      return
    }

    setUpdating(true)
    try {
      const body = { fullName }
      if (password) {
        body.password = password
      }

      const res = await fetch('http://localhost:8080/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedProfile = await res.json()
      await refreshProfile()
      showSuccess('Profile updated successfully!')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      showError(err.message || 'Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  if (!profile) {
    return (
      <div className="page-shell bg-pattern">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card text-center py-16">
              <p className="text-white/70 text-lg">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isFreelancer = profile.roles?.some(role => role.name === 'FREELANCER')
  const isClient = profile.roles?.some(role => role.name === 'CLIENT')

  return (
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="hero-grid">
            <div className="space-y-6">
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Account settings
              </p>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  My <span className="gradient-text">profile</span>
                </h1>
                <p className="text-white/70 text-lg max-w-xl mt-4">
                  Manage your account information, roles, and onboarding status.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {profile.roles?.some(role => role.name === 'FREELANCER') && (
              <Link
                to="/onboarding/freelancer"
                className="card bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 hover:border-violet-400/60 transition-all"
              >
                <p className="text-sm font-bold text-white/70 uppercase tracking-wide mb-1">Freelancer onboarding</p>
                <h3 className="text-lg font-bold text-white mb-2">Complete your rich freelancer profile</h3>
                <p className="text-white/70 text-sm mb-3">Unlock bidding, proposals, and talent search visibility.</p>
                <span className="inline-flex items-center text-sm font-semibold text-violet-100">
                  Go to workspace →
                </span>
              </Link>
            )}
            {profile.roles?.some(role => role.name === 'CLIENT') && (
              <Link
                to="/onboarding/client"
                className="card bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 hover:border-cyan-400/60 transition-all"
              >
                <p className="text-sm font-bold text-white/70 uppercase tracking-wide mb-1">Client onboarding</p>
                <h3 className="text-lg font-bold text-white mb-2">Verify your company and hiring needs</h3>
                <p className="text-white/70 text-sm mb-3">Get priority placement and access to escrow + payments.</p>
                <span className="inline-flex items-center text-sm font-semibold text-cyan-100">
                  Open dashboard →
                </span>
              </Link>
            )}
          </div>

          <div className="card border-2 border-white/10">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-purple-500/30 flex-shrink-0">
                {profile.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{profile.fullName}</h2>
                <p className="text-white/70 text-lg mb-3">{profile.email}</p>
                <div className="flex gap-2 flex-wrap">
                  {profile.roles?.map(role => (
                    <span key={role.id} className="badge badge-primary text-sm">
                      {role.name.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="John Doe"
                  disabled={updating}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="input-field"
                />
                <p className="text-xs text-white/50 mt-1">Email cannot be changed</p>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
                <p className="text-sm text-white/70 mb-4">Leave blank if you don't want to change your password</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                      placeholder="Leave blank to keep current password"
                      minLength={6}
                      disabled={updating}
                    />
                  </div>
                  {password && (
                    <div>
                      <label className="block text-sm font-bold text-white/90 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-field"
                        placeholder="Re-enter your new password"
                        minLength={6}
                        disabled={updating}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="btn btn-primary flex-1"
                >
                  {updating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

