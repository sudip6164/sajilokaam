import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 mb-8">Welcome back, {profile?.fullName}!</p>
          
          {profile && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Profile</h2>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Name:</span> {profile.fullName}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {profile.email}
                  </p>
                </div>
              </div>
              
              <div className="card">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
                <div className="space-y-3">
                  <Link to="/jobs/new" className="btn btn-primary w-full block text-center">
                    Post a New Job
                  </Link>
                  <Link to="/jobs" className="btn btn-secondary w-full block text-center">
                    Browse Jobs
                  </Link>
                  <Link to="/projects" className="btn btn-secondary w-full block text-center">
                    View Projects
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
