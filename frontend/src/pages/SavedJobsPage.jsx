import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'
import { gradients } from '../theme/designSystem'

export function SavedJobsPage() {
  const { token } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [savedJobs, setSavedJobs] = useState([])
  const [bidCounts, setBidCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      loadSavedJobs()
    }
  }, [token])

  const loadSavedJobs = async () => {
    try {
      const saved = await api.savedJobs.getAll(token)
      const jobs = saved.map(sj => sj.job)
      setSavedJobs(jobs)
      
      // Load bid counts
      const counts = {}
      await Promise.all(
        jobs.map(async (job) => {
          try {
            const count = await api.jobs.getBidCount(job.id)
            counts[job.id] = count
          } catch (err) {
            console.error(`Failed to load bid count for job ${job.id}`, err)
          }
        })
      )
      setBidCounts(counts)
    } catch (err) {
      showError(err.message || 'Failed to load saved jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (e, jobId) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.savedJobs.unsave(jobId, token)
      setSavedJobs(prev => prev.filter(job => job.id !== jobId))
      showSuccess('Job removed from saved')
    } catch (err) {
      showError(err.message || 'Failed to remove saved job')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      OPEN: 'badge badge-success',
      CLOSED: 'badge badge-gray',
      IN_PROGRESS: 'badge badge-warning'
    }
    return badges[status] || 'badge badge-gray'
  }

  const stats = {
    total: savedJobs.length,
    open: savedJobs.filter(j => j.status === 'OPEN').length,
    totalBids: Object.values(bidCounts).reduce((sum, count) => sum + (count || 0), 0)
  }

  const heroStats = [
    {
      label: 'Saved jobs',
      value: stats.total,
      accent: 'from-violet-500 to-purple-600',
      detail: 'bookmarked'
    },
    {
      label: 'Open',
      value: stats.open,
      accent: 'from-emerald-500 to-teal-500',
      detail: 'accepting bids'
    },
    {
      label: 'Total bids',
      value: stats.totalBids,
      accent: 'from-amber-500 to-orange-500',
      detail: 'across saved jobs'
    }
  ]

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
            <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card">
                  <div className="loading-skeleton h-6 w-3/4 mb-3"></div>
                  <div className="loading-skeleton h-4 w-full mb-2"></div>
                  <div className="loading-skeleton h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="hero-grid">
            <div className="space-y-6">
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Bookmarks
              </p>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  <span className="gradient-text">Saved jobs</span>
                </h1>
                <p className="text-white/70 text-lg max-w-xl mt-4">
                  Your bookmarked job opportunities ready for review and bidding.
                </p>
              </div>
              {savedJobs.length > 0 && (
                <div className="grid sm:grid-cols-3 gap-3">
                  {heroStats.map(stat => (
                    <div key={stat.label} className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-1">{stat.label}</p>
                      <p className="text-2xl font-black text-white">{stat.value}</p>
                      <p className="text-xs text-white/60">{stat.detail}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Link to="/jobs" className="btn btn-primary">
                  Browse More Jobs
                </Link>
              </div>
            </div>
          </div>

          {savedJobs.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No saved jobs</h3>
              <p className="text-white/70 mb-6">Start saving jobs you're interested in to view them here</p>
              <Link to="/jobs" className="btn btn-primary">
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedJobs.map(job => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="group block relative"
                >
                  <div className="card border-2 border-white/10 hover:border-violet-500/50 hover:shadow-lg transition-all">
                  <button
                    onClick={(e) => handleUnsave(e, job.id)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    title="Remove from saved"
                  >
                    <svg
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h2 className="text-2xl font-bold text-white group-hover:text-violet-400 transition-colors">
                          {job.title}
                        </h2>
                        <span className={getStatusBadge(job.status)}>
                          {job.status}
                        </span>
                        {job.category && (
                          <span className="badge badge-ghost">{job.category.name}</span>
                        )}
                        {job.jobType && (
                          <span className="badge badge-primary">{job.jobType.replace('_', ' ')}</span>
                        )}
                      </div>
                      <p className="text-white/70 mb-4 line-clamp-2 leading-relaxed">
                        {job.description || 'No description provided'}
                      </p>
                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.requiredSkills.slice(0, 5).map(skill => (
                            <span key={skill.id} className="badge badge-secondary text-xs">
                              {skill.name}
                            </span>
                          ))}
                          {job.requiredSkills.length > 5 && (
                            <span className="badge badge-ghost text-xs">
                              +{job.requiredSkills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-white/60 flex-wrap">
                        {job.client && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-purple-500/30">
                              {job.client.fullName?.charAt(0) || 'U'}
                            </div>
                            <span className="text-white/80">{job.client.fullName}</span>
                          </div>
                        )}
                        {job.budgetMin && job.budgetMax && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold text-white/90">
                              Rs. {job.budgetMin.toLocaleString()} - Rs. {job.budgetMax.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {job.experienceLevel && (
                          <span className="text-white/80">{job.experienceLevel} Level</span>
                        )}
                        {job.createdAt && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold text-white/90">
                            {bidCounts[job.id] !== undefined ? bidCounts[job.id] : '-'} {bidCounts[job.id] === 1 ? 'Bid' : 'Bids'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-violet-400 group-hover:translate-x-1 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

