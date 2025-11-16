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
    activeProjects: 0,
    pendingBids: 0,
    acceptedBids: 0,
    totalBidsReceived: 0,
    pendingBidsToReview: 0
  })
  const [recentJobs, setRecentJobs] = useState([])
  const [recentProjects, setRecentProjects] = useState([])
  const [recentBids, setRecentBids] = useState([])
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
      const isClient = profile.roles?.some(r => r.name === 'CLIENT')
      const isFreelancer = profile.roles?.some(r => r.name === 'FREELANCER')
      
      // Load jobs
      if (isClient) {
        const jobsRes = await fetch('http://localhost:8080/api/jobs/my-jobs', { headers })
        if (jobsRes.ok) {
          const jobs = await jobsRes.json()
          const jobsList = Array.isArray(jobs) ? jobs : []
          setRecentJobs(jobsList.slice(0, 3))
          setStats(prev => ({ ...prev, jobs: jobsList.length }))
          
          // Calculate total bids received and pending bids to review
          let totalBids = 0
          let pendingBids = 0
          await Promise.all(
            jobsList.map(async (job) => {
              try {
                const bidRes = await fetch(`http://localhost:8080/api/jobs/${job.id}/bids`, { headers })
                if (bidRes.ok) {
                  const bids = await bidRes.json()
                  const bidsList = Array.isArray(bids) ? bids : []
                  totalBids += bidsList.length
                  pendingBids += bidsList.filter(b => b.status === 'PENDING').length
                }
              } catch (err) {
                console.error(`Failed to load bids for job ${job.id}`, err)
              }
            })
          )
          setStats(prev => ({ 
            ...prev, 
            totalBidsReceived: totalBids,
            pendingBidsToReview: pendingBids
          }))
        }
      }

      // Load projects
      const projectsRes = await fetch('http://localhost:8080/api/projects', { headers })
      if (projectsRes.ok) {
        const projects = await projectsRes.json()
        const projectsList = Array.isArray(projects) ? projects : []
        
        // Filter projects based on role
        let myProjects = []
        if (isClient) {
          // Client's projects (from their jobs)
          myProjects = projectsList.filter(p => p.job?.client?.id === profile.id)
        } else if (isFreelancer) {
          // Freelancer's projects (from accepted bids)
          myProjects = projectsList.filter(p => {
            // Check if freelancer has tasks assigned in this project
            // For now, we'll show all projects - can be enhanced later
            return true
          })
        }
        
        setRecentProjects(myProjects.slice(0, 3))
        setStats(prev => ({ 
          ...prev, 
          projects: myProjects.length,
          activeProjects: myProjects.filter(p => p.job?.status !== 'CLOSED' && p.job?.status !== 'IN_PROGRESS').length
        }))
      }

      // Load bids (for freelancers)
      if (isFreelancer) {
        const bidsRes = await fetch('http://localhost:8080/api/jobs/my-bids', { headers })
        if (bidsRes.ok) {
          const bids = await bidsRes.json()
          const bidsList = Array.isArray(bids) ? bids : []
          setRecentBids(bidsList.slice(0, 3))
          
          const pendingBids = bidsList.filter(b => b.status === 'PENDING').length
          const acceptedBids = bidsList.filter(b => b.status === 'ACCEPTED').length
          
          setStats(prev => ({ 
            ...prev, 
            bids: bidsList.length,
            pendingBids: pendingBids,
            acceptedBids: acceptedBids
          }))
        }
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
    <div className="min-h-screen py-12 bg-pattern">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Welcome back, <span className="font-bold gradient-text">{profile?.fullName}</span>! Here's what's happening.
            </p>
          </div>
          
          {profile && (
            <>
              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {isClient && (
                  <>
                    <div className="card hover-lift group">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl blur-lg opacity-50"></div>
                          <div className="relative w-14 h-14 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">My Jobs</p>
                          <p className="text-3xl font-black text-white">{stats.jobs}</p>
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
                          <p className="text-sm font-semibold text-white/60">Active Projects</p>
                          <p className="text-2xl font-extrabold text-white">{stats.activeProjects}</p>
                        </div>
                      </div>
                    </div>
                    <div className="card group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white/60">Total Bids Received</p>
                          <p className="text-2xl font-extrabold text-white">{stats.totalBidsReceived}</p>
                        </div>
                      </div>
                    </div>
                    <div className="card group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white/60">Pending Review</p>
                          <p className="text-2xl font-extrabold text-white">{stats.pendingBidsToReview}</p>
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
                          <p className="text-sm font-semibold text-white/60">My Projects</p>
                          <p className="text-2xl font-extrabold text-white">{stats.projects}</p>
                        </div>
                      </div>
                    </div>
                    <div className="card group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white/60">Total Bids</p>
                          <p className="text-2xl font-extrabold text-white">{stats.bids}</p>
                        </div>
                      </div>
                    </div>
                    <div className="card group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white/60">Pending Bids</p>
                          <p className="text-2xl font-extrabold text-white">{stats.pendingBids}</p>
                        </div>
                      </div>
                    </div>
                    <div className="card group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white/60">Accepted Bids</p>
                          <p className="text-2xl font-extrabold text-white">{stats.acceptedBids}</p>
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
                      <p className="text-sm font-semibold text-white/60">Total Projects</p>
                      <p className="text-2xl font-extrabold text-white">{stats.projects}</p>
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
                    <h2 className="text-xl font-bold text-white">Profile</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white/60">Name:</span>
                      <span className="text-sm font-bold text-white">{profile.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white/60">Email:</span>
                      <span className="text-sm font-bold text-white break-all">{profile.email}</span>
                    </div>
                    {profile.roles && profile.roles.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white/60">Role:</span>
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
                    <h2 className="text-xl font-bold text-white">Quick Actions</h2>
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
                    <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                  </div>
                  <div className="space-y-3">
                    {recentJobs.length === 0 && recentProjects.length === 0 && recentBids.length === 0 ? (
                      <p className="text-sm text-white/60 text-center py-4">No recent activity</p>
                    ) : (
                      <>
                        {recentJobs.slice(0, 2).map(job => (
                          <Link
                            key={job.id}
                            to={`/jobs/${job.id}`}
                            className="block p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                          >
                            <p className="text-sm font-semibold text-white truncate">{job.title}</p>
                            <p className="text-xs text-white/60">Job • {job.status}</p>
                          </Link>
                        ))}
                        {recentProjects.slice(0, 2).map(project => (
                          <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="block p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                          >
                            <p className="text-sm font-semibold text-white truncate">{project.title}</p>
                            <p className="text-xs text-white/60">Project</p>
                          </Link>
                        ))}
                        {recentBids.slice(0, 2).map(bid => (
                          <Link
                            key={bid.id}
                            to={`/jobs/${bid.job?.id}`}
                            className="block p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                          >
                            <p className="text-sm font-semibold text-white truncate">{bid.job?.title || 'Job'}</p>
                            <p className="text-xs text-white/60">Bid • ${bid.amount} • {bid.status}</p>
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
                        <h2 className="text-xl font-bold text-white">Recent Jobs</h2>
                        <Link to="/jobs" className="text-sm text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                          View All →
                        </Link>
                      </div>
                      <div className="space-y-3">
                        {recentJobs.map(job => (
                          <Link
                            key={job.id}
                            to={`/jobs/${job.id}`}
                            className="block p-4 border-2 border-white/10 rounded-xl hover:border-violet-500/50 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
                                <p className="text-sm text-white/70 line-clamp-2">{job.description || 'No description'}</p>
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
                        <h2 className="text-xl font-bold text-white">Recent Projects</h2>
                        <Link to="/projects" className="text-sm text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                          View All →
                        </Link>
                      </div>
                      <div className="space-y-3">
                        {recentProjects.map(project => (
                          <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="block p-4 border-2 border-white/10 rounded-xl hover:border-violet-500/50 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1">{project.title}</h3>
                                <p className="text-sm text-white/70 line-clamp-2">{project.description || 'No description'}</p>
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
