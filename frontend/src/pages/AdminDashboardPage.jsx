import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'
import { gradients } from '../theme/designSystem'

export function AdminDashboardPage() {
  const { token, profile } = useAuth()
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalBids: 0,
    totalProjects: 0,
    totalTasks: 0
  })
  const [loading, setLoading] = useState(true)
  const { error: showError } = useToast()

  useEffect(() => {
    if (token && profile) {
      loadAnalytics()
    }
  }, [token, profile])

  const loadAnalytics = async () => {
    try {
      const data = await api.admin.getAnalytics(token)
      setAnalytics(data)
    } catch (err) {
      showError(err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-shell bg-pattern">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="hero-grid">
              <div className="space-y-6">
                <div className="loading-skeleton h-8 w-48"></div>
                <div className="loading-skeleton h-12 w-3/4"></div>
                <div className="loading-skeleton h-6 w-1/2"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="card">
                  <div className="loading-skeleton h-8 w-3/4 mb-4"></div>
                  <div className="loading-skeleton h-4 w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: analytics.totalUsers, icon: '👥', link: '/admin/users', color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Jobs', value: analytics.totalJobs, icon: '💼', link: '/jobs', color: 'from-violet-500 to-purple-500' },
    { label: 'Total Bids', value: analytics.totalBids, icon: '📝', link: '/jobs', color: 'from-pink-500 to-rose-500' },
    { label: 'Total Projects', value: analytics.totalProjects, icon: '📁', link: '/projects', color: 'from-green-500 to-emerald-500' },
    { label: 'Total Tasks', value: analytics.totalTasks, icon: '✅', link: '/projects', color: 'from-orange-500 to-amber-500' }
  ]

  return (
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="hero-grid">
            <div className="space-y-6">
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Admin Console
              </p>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  Admin <span className="gradient-text">dashboard</span>
                </h1>
                <p className="text-white/70 text-lg max-w-xl mt-4">
                  Monitor platform activity, manage users, and oversee system operations.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/admin/users" className="btn btn-primary">
                Manage Users
              </Link>
              <Link to="/admin/settings" className="btn btn-secondary">
                System Settings
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Link
                key={index}
                to={stat.link}
                className="card hover:scale-105 transition-transform duration-200 cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                  {stat.icon}
                </div>
                <h3 className="text-white/70 text-sm font-medium mb-1">{stat.label}</h3>
                <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/admin/users" className="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">User Management</span>
                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
                <Link to="/admin/settings" className="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">System Settings</span>
                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
                <Link to="/admin/profiles" className="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Profile Verification</span>
                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
                <Link to="/admin/payments" className="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Payments & Disputes</span>
                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
                <Link to="/admin/activity-logs" className="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Activity Logs</span>
                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
                <Link to="/admin/audit-trail" className="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Audit Trail</span>
                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4">Platform Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Users</span>
                  <span className="text-white font-semibold">{analytics.totalUsers}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Active Jobs</span>
                  <span className="text-white font-semibold">{analytics.totalJobs}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Projects</span>
                  <span className="text-white font-semibold">{analytics.totalProjects}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Tasks</span>
                  <span className="text-white font-semibold">{analytics.totalTasks}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

