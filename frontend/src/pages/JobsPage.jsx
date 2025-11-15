import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

export function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const { token, profile } = useAuth()
  const { error: showError } = useToast()

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      const res = await fetch('http://localhost:8080/api/jobs', { headers })
      if (!res.ok) throw new Error('Failed to load jobs')
      const data = await res.json()
      setJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter jobs based on search and status
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = searchQuery === '' || 
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [jobs, searchQuery, statusFilter])

  const getStatusBadge = (status) => {
    const badges = {
      OPEN: 'badge badge-success',
      CLOSED: 'badge badge-gray',
      IN_PROGRESS: 'badge badge-warning'
    }
    return badges[status] || 'badge badge-gray'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const isClient = profile?.roles?.some(r => r.name === 'CLIENT')

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="loading-skeleton h-10 w-64 mb-8"></div>
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
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h1 className="page-title">Job Listings</h1>
              <p className="page-subtitle">Browse available freelance opportunities</p>
            </div>
            {isClient && (
              <Link to="/jobs/new" className="btn btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Post New Job
              </Link>
            )}
          </div>

          {/* Search and Filter Bar */}
          <div className="card mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search jobs by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-12"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`btn ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'} text-sm`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('OPEN')}
                  className={`btn ${statusFilter === 'OPEN' ? 'btn-primary' : 'btn-secondary'} text-sm`}
                >
                  Open
                </button>
                <button
                  onClick={() => setStatusFilter('IN_PROGRESS')}
                  className={`btn ${statusFilter === 'IN_PROGRESS' ? 'btn-primary' : 'btn-secondary'} text-sm`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setStatusFilter('CLOSED')}
                  className={`btn ${statusFilter === 'CLOSED' ? 'btn-primary' : 'btn-secondary'} text-sm`}
                >
                  Closed
                </button>
              </div>
            </div>

            {/* Results Count */}
            {searchQuery || statusFilter !== 'ALL' ? (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold text-gray-900">{filteredJobs.length}</span> of <span className="font-bold text-gray-900">{jobs.length}</span> jobs
                </p>
              </div>
            ) : null}
          </div>
          
          {filteredJobs.length === 0 ? (
            <div className="card text-center py-16">
              {jobs.length === 0 ? (
                <>
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs available</h3>
                  <p className="text-gray-600 mb-6">Be the first to post a job opportunity!</p>
                  {isClient && (
                    <Link to="/jobs/new" className="btn btn-primary inline-flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Post the First Job
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs match your filters</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('ALL')
                    }}
                    className="btn btn-secondary"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredJobs.map(job => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="card group hover:border-blue-300 hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h2>
                        <span className={getStatusBadge(job.status)}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {job.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(job.createdAt)}</span>
                        </div>
                        {job.client && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {job.client.fullName?.charAt(0) || 'U'}
                            </div>
                            <span className="font-medium">{job.client.fullName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-blue-600 group-hover:translate-x-1 transition-transform flex-shrink-0">
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
