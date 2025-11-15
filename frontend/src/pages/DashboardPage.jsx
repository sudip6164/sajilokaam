import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back, {profile?.fullName}! Here's what's happening.</p>
          </div>
          
          {profile && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="card group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Profile</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500">Name:</span>
                    <span className="text-sm font-bold text-gray-900">{profile.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500">Email:</span>
                    <span className="text-sm font-bold text-gray-900">{profile.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="card group hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                </div>
                <div className="space-y-3">
                  <Link to="/jobs/new" className="btn btn-primary w-full block text-center">
                    Post New Job
                  </Link>
                  <Link to="/jobs" className="btn btn-secondary w-full block text-center">
                    Browse Jobs
                  </Link>
                  <Link to="/projects" className="btn btn-secondary w-full block text-center">
                    View Projects
                  </Link>
                </div>
              </div>

              <div className="card group hover:scale-[1.02] transition-transform md:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Stats</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-600">Active Jobs</span>
                    <span className="text-lg font-bold text-gray-900">-</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-600">Projects</span>
                    <span className="text-lg font-bold text-gray-900">-</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
