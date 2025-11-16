import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children }) {
  const { token, profile, loading } = useAuth()

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pattern">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    )
  }

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // If token exists but profile is still loading (shouldn't happen, but safety check)
  if (token && !profile && !loading) {
    // This might happen briefly during login, wait a bit
    return (
      <div className="min-h-screen flex items-center justify-center bg-pattern">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mb-4"></div>
          <p className="text-white/70">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  return children
}
