import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { profile } = useAuth()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {profile && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome, {profile.fullName}!</h2>
          <p className="text-gray-600 mb-4">{profile.email}</p>
          <Link
            to="/jobs"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  )
}

