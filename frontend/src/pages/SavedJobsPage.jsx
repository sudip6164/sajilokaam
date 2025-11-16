import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

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

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-pattern">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="loading-skeleton h-10 w-48 mb-8"></div>
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
    <div className="min-h-screen py-12 bg-pattern">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="page-title">Saved Jobs</h1>
            <p className="page-subtitle">Your bookmarked job opportunities</p>
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
            <div className="grid gap-6">
              {savedJobs.map(job => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="card group hover-lift relative"
                >
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
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

