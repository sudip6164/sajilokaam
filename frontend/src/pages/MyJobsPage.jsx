import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

export function MyJobsPage() {
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const { token, profile } = useAuth()
  const { error: showError } = useToast()

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [statusFilter, searchQuery, jobs])

  const loadJobs = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` }
      const res = await fetch('http://localhost:8080/api/jobs/my-jobs', { headers })
      if (!res.ok) throw new Error('Failed to load jobs')
      const data = await res.json()
      const jobsList = Array.isArray(data) ? data : []
      setJobs(jobsList)
      setFilteredJobs(jobsList)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filterJobs = () => {
    let filtered = [...jobs]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(job => job.status === statusFilter)
    }

    setFilteredJobs(filtered)
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
          <div className="mb-10">
            <h1 className="page-title">My Jobs</h1>
            <p className="page-subtitle">Manage all your posted jobs and track their progress</p>
          </div>

          {jobs.length > 0 && (
            <div className="card mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search jobs by title or description..."
                      className="input-field pl-12"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field w-auto"
                  >
                    <option value="ALL">All Status ({jobs.length})</option>
                    <option value="OPEN">Open ({jobs.filter(j => j.status === 'OPEN').length})</option>
                    <option value="IN_PROGRESS">In Progress ({jobs.filter(j => j.status === 'IN_PROGRESS').length})</option>
                    <option value="CLOSED">Closed ({jobs.filter(j => j.status === 'CLOSED').length})</option>
                  </select>
                  {(searchQuery || statusFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setStatusFilter('ALL')
                      }}
                      className="btn btn-secondary whitespace-nowrap"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              {(searchQuery || statusFilter !== 'ALL') && (
                <p className="text-sm text-gray-600 mt-3">
                  Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {jobs.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-600 mb-4">Start posting jobs to find talented freelancers.</p>
              <Link to="/jobs/new" className="btn btn-primary inline-flex items-center">
                Post Your First Job
              </Link>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-2">Try adjusting your search or filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('ALL')
                }}
                className="btn btn-secondary mt-4"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredJobs.map(job => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="card group hover:border-blue-300 transition-all"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                            {job.title}
                          </h2>
                          <span className={getStatusBadge(job.status)}>{job.status}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {job.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
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

