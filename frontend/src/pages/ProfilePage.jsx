import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

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
      <div className="min-h-screen py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="card text-center py-16">
              <p className="text-gray-500 text-lg">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Manage your account information and settings</p>
          </div>

          <div className="card mb-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {profile.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
                <p className="text-gray-600">{profile.email}</p>
                <div className="flex gap-2 mt-2">
                  {profile.roles?.map(role => (
                    <span key={role.id} className="badge badge-primary">
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="input-field bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                <p className="text-sm text-gray-600 mb-4">Leave blank if you don't want to change your password</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
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

