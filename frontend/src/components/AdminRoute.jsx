import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function AdminRoute({ children }) {
  const { profile, loading } = useAuth()

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

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  const isAdmin = profile.roles?.some(role => role.name === 'ADMIN')

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pattern">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white/70 mb-6">You do not have permission to access this page.</p>
          <a href="/" className="btn btn-primary">Go to Dashboard</a>
        </div>
      </div>
    )
  }

  return children
}

