import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

export function DashboardPage() {
  const { profile, token } = useAuth()
  const [stats, setStats] = useState({
    jobs: 0,
    projects: 0,
    bids: 0,
    activeProjects: 0
  })
  const [recentJobs, setRecentJobs] = useState([])
  const [recentProjects, setRecentProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const { error: showError } = useToast()

  useEffect(() => {
    if (profile && token) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [profile, token])

  const loadDashboardData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` }
      
      // Load jobs
      const jobsRes = await fetch('http://localhost:8080/api/jobs', { headers })
      if (jobsRes.ok) {
        const jobs = await jobsRes.json()
        const myJobs = Array.isArray(jobs) ? jobs.filter(j => j.client?.id === profile.id) : []
        setRecentJobs(myJobs.slice(0, 3))
        setStats(prev => ({ ...prev, jobs: myJobs.length }))
      }

      // Load projects
      const projectsRes = await fetch('http://localhost:8080/api/projects', { headers })
      if (projectsRes.ok) {
        const projects = await projectsRes.json()
        const myProjects = Array.isArray(projects) ? projects : []
        setRecentProjects(myProjects.slice(0, 3))
        setStats(prev => ({ 
          ...prev, 
          projects: myProjects.length,
          activeProjects: myProjects.filter(p => p.job?.status !== 'CLOSED').length
        }))
      }

      // Load bids (for freelancers)
      if (profile.roles?.some(r => r.name === 'FREELANCER')) {
        // We'll need to get bids from jobs - for now, we'll skip this
        // In a real app, you'd have a /api/bids endpoint
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err)
      showError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const isClient = profile?.roles?.some(r => r.name === 'CLIENT')
  const isFreelancer = profile?.roles?.some(r => r.name === 'FREELANCER')

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="loading-skeleton h-10 w-64 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card">
                  <div className="loading-skeleton h-6 w-3/4 mb-3"></div>
                  <div className="loading-skeleton h-4 w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Welcome back, <span className="font-bold text-blue-600">{profile?.fullName}</span>! Here's what's happening.
            </p>
          </div>
          
          {profile && (
            <>
              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {isClient && (
                  <>
                    <div className="card group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-500">My Jobs</p>
                          <p className="text-2xl font-extrabold text-gray-900">{stats.jobs}</p>
                        </div>
                      </div>
                    </div>
                    <div className="card group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-500">Active Projects</p>
                          <p className="text-2xl font-extrabold text-gray-900">{stats.activeProjects}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {isFreelancer && (
                  <>
                    <div className="card group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-500">My Projects</p>
                          <p className="text-2xl font-extrabold text-gray-900">{stats.projects}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="card group hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500">Total Projects</p>
                      <p className="text-2xl font-extrabold text-gray-900">{stats.projects}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Profile Card */}
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
                      <span className="text-sm font-bold text-gray-900 break-all">{profile.email}</span>
                    </div>
                    {profile.roles && profile.roles.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-500">Role:</span>
                        {profile.roles.map((role, idx) => (
                          <span key={idx} className="badge badge-primary">
                            {role.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick Actions */}
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
                    {isClient && (
                      <Link to="/jobs/new" className="btn btn-primary w-full block text-center">
                        Post New Job
                      </Link>
                    )}
                    <Link to="/jobs" className="btn btn-secondary w-full block text-center">
                      Browse Jobs
                    </Link>
                    <Link to="/projects" className="btn btn-secondary w-full block text-center">
                      View Projects
                    </Link>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="card group hover:scale-[1.02] transition-transform lg:col-span-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  </div>
                  <div className="space-y-3">
                    {recentJobs.length === 0 && recentProjects.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                    ) : (
                      <>
                        {recentJobs.slice(0, 2).map(job => (
                          <Link
                            key={job.id}
                            to={`/jobs/${job.id}`}
                            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
                            <p className="text-xs text-gray-500">Job • {job.status}</p>
                          </Link>
                        ))}
                        {recentProjects.slice(0, 2).map(project => (
                          <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <p className="text-sm font-semibold text-gray-900 truncate">{project.title}</p>
                            <p className="text-xs text-gray-500">Project</p>
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Jobs/Projects Section */}
              {(recentJobs.length > 0 || recentProjects.length > 0) && (
                <div className="grid lg:grid-cols-2 gap-6">
                  {recentJobs.length > 0 && (
                    <div className="card">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Recent Jobs</h2>
                        <Link to="/jobs" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                          View All →
                        </Link>
                      </div>
                      <div className="space-y-3">
                        {recentJobs.map(job => (
                          <Link
                            key={job.id}
                            to={`/jobs/${job.id}`}
                            className="block p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">{job.description || 'No description'}</p>
                              </div>
                              <span className="badge badge-primary whitespace-nowrap">{job.status}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {recentProjects.length > 0 && (
                    <div className="card">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
                        <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                          View All →
                        </Link>
                      </div>
                      <div className="space-y-3">
                        {recentProjects.map(project => (
                          <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="block p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{project.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">{project.description || 'No description'}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
